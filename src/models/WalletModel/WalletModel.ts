import { DependencyContainer, instanceCachingFactory, Lifecycle, singleton } from 'tsyringe';
import { autorun, computed, makeObservable, observable, reaction, runInAction } from 'mobx';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  SolletExtensionWalletAdapter,
  SolletWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { PublicKey } from '@solana/web3.js';
import { DependencyService } from '../../services/injection/DependencyContext';

@singleton()
export class WalletModel {
  name: string;
  publicKey: string;
  adaptors: Adapter[] = [];
  network: WalletAdapterNetwork;

  selectedAdaptor: Adapter | null = null;

  constructor(network = WalletAdapterNetwork.Devnet) {
    this.name = '';
    this.network = network;
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

    this.createReactions();
  }

  protected createReactions() {
    autorun(() => {
      if (this.network) {
        this.setupAdaptors();
      }
    });

    const connectDs = reaction(
      () => this.publicKey,
      () => {
        console.log(`~~~ public key changed: ${this.publicKey}`);
      }
    );

    const connectDs1 = reaction(
      () => this.connected,
      () => {
        console.log(`~~~ connected state: ${this.connected}`);
      }
    );
  }

  protected setupAdaptors() {
    const { network } = this;
    const newAdaptors = [
      this.setUpAdaptor(new PhantomWalletAdapter()),
      this.setUpAdaptor(new SolflareWalletAdapter()),
      this.setUpAdaptor(new SolletWalletAdapter({ network })),
      this.setUpAdaptor(new SolletExtensionWalletAdapter({ network })),
    ];

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
