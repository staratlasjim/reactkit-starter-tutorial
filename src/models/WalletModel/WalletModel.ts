import '@abraham/reflection';
import { singleton } from 'tsyringe';
import { autorun, computed, makeObservable, observable, runInAction } from 'mobx';
import {
  Adapter,
  MessageSignerWalletAdapter,
  SignerWalletAdapter,
  WalletAdapterNetwork,
} from '@solana/wallet-adapter-base';
import { PublicKey, Transaction } from '@solana/web3.js';
import { WalletAdaptorService } from '../../services/WalletAdaptorService/WalletAdaptorService';
import { Model } from '../Model';

@singleton()
export class WalletModel extends Model {
  name: string;
  publicKey: string;
  adaptors: Adapter[] = [];
  network: WalletAdapterNetwork;
  connected: boolean;
  selectedAdaptor: Adapter | null = null;

  constructor(protected walletAdaptorService: WalletAdaptorService) {
    super();
    this.name = '';
    this.network = WalletAdapterNetwork.Devnet;
    this.publicKey = '';
    this.connected = false;
    makeObservable(this, {
      name: observable,
      publicKey: observable,
      network: observable,
      connected: observable,
      adaptors: observable,
      selectedAdaptor: observable,
      pubKey: computed,
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
      this.connected = this.selectedAdaptor.connected;
      this.name = adaptor.name;
      this.publicKey = publicKey.toBase58();
    });
  }

  protected onDisconnect(adaptor: Adapter) {
    runInAction(() => {
      this.connected = adaptor.connected;
      this.name = '';
      this.publicKey = '';
    });
  }

  protected setUpAdaptor(adaptor: Adapter): Adapter {
    adaptor.on('connect', (publicKey: PublicKey) => {
      this.onConnect(adaptor, publicKey);
    });
    adaptor.on('disconnect', () => {
      this.onDisconnect(adaptor);
    });
    if (adaptor.connected && adaptor.publicKey) {
      this.onConnect(adaptor, adaptor.publicKey);
    }
    return adaptor;
  }

  get pubKey(): PublicKey {
    return new PublicKey(this.publicKey);
  }

  get signer(): SignerWalletAdapter {
    return this.selectedAdaptor as SignerWalletAdapter;
  }

  get messageSigner(): MessageSignerWalletAdapter {
    return this.selectedAdaptor as MessageSignerWalletAdapter;
  }

  public signAllTransactions(transactions: Array<Transaction>): Promise<Array<Transaction>> {
    if (!this.selectedAdaptor) throw new Error('Not connected to an adaptor');

    const signer = this.signer;
    return signer.signAllTransactions(transactions);
  }

  public signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.selectedAdaptor) throw new Error('Not connected to a wallet adaptor');

    return this.signer.signTransaction(transaction);
  }
}
