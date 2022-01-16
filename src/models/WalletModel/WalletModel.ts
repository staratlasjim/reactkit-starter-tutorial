import '@abraham/reflection';
import { singleton } from 'tsyringe';
import { autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PublicKey } from '@solana/web3.js';
import { WalletAdaptorService } from '../../services/WalletAdaptorService/WalletAdaptorService';
import { Model } from '../Model';

@singleton()
export class WalletModel extends Model {
  name: string;
  publicKey: string;
  adaptors: Adapter[] = [];
  network: WalletAdapterNetwork;

  selectedAdaptor: Adapter | null = null;

  constructor(protected walletAdaptorService: WalletAdaptorService) {
    super();
    this.name = '';
    this.network = WalletAdapterNetwork.Devnet;
    this.publicKey = '';
    makeObservable(this, {
      name: observable,
      publicKey: observable,
      network: observable,
      adaptors: observable,
      selectedAdaptor: observable,
      connected: computed,
    });

    this.onConnect = this.onConnect.bind(this);
    this.onDisconnect = this.onDisconnect.bind(this);
  }

  protected createReactions() {
    this.addReaction(
      autorun(() => {
        if (this.network) {
          this.setupAdaptors();
        }
      })
    );
  }

  protected onInitialize(): void {
    this.createReactions();
  }

  protected onEnd() {
    this.adaptors.forEach((adapter) => {
      adapter.removeAllListeners('connect');
      adapter.removeAllListeners('disconnect');
    });
    super.onEnd();
  }

  protected setupAdaptors() {
    const { network } = this;

    const originalAdaptors = this.walletAdaptorService.getAdaptors(network);

    const newAdaptors = originalAdaptors.map((value) => this.setUpAdaptor(value));

    runInAction(() => {
      this.adaptors = newAdaptors;
    });
  }

  protected onConnect(adaptor: Adapter, publicKey: PublicKey) {
    runInAction(() => {
      this.selectedAdaptor = adaptor;
      console.log(`~~~~ RIA: onConnect: ${publicKey}`, adaptor);
      this.name = adaptor.name;
      this.publicKey = publicKey.toBase58();
    });
  }

  protected onDisconnect(adaptor: Adapter) {
    runInAction(() => {
      this.selectedAdaptor = null;
      this.name = '';
      this.publicKey = '';
    });
  }

  protected setUpAdaptor(adaptor: Adapter): Adapter {
    adaptor.on('connect', (publicKey: PublicKey) => {
      console.log(`~~~~ connect: ${publicKey}`);
      this.onConnect(adaptor, publicKey);
    });
    adaptor.on('disconnect', () => {
      console.log(`~~~~ disconnect`);
      this.onDisconnect(adaptor);
    });
    if (adaptor.connected && adaptor.publicKey) {
      this.onConnect(adaptor, adaptor.publicKey);
    }
    return adaptor;
  }

  get connected(): boolean {
    if (!this.selectedAdaptor) return false;

    return this.selectedAdaptor.connected;
  }
}
