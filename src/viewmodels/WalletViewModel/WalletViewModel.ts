import { computed, makeObservable } from 'mobx';
import { WalletModel } from '../../models/WalletModel/WalletModel';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ViewModel } from '../ViewModel';
import { injectable } from 'tsyringe';

@injectable()
export class WalletViewModel extends ViewModel {
  constructor(protected wallet: WalletModel) {
    super();

    makeObservable(this, {
      connected: computed,
      name: computed,
      publicKey: computed,
      adaptors: computed,
      network: computed,
    });
  }

  protected onInitialize(): void {
    this.wallet.initialize();
  }
  protected afterReactionsRemoved(): void {
    this.wallet.end();
  }

  get name(): string {
    return this.wallet.name;
  }

  get publicKey(): string {
    return this.wallet.publicKey;
  }

  get connected(): boolean {
    return this.wallet.connected;
  }

  get adaptors(): Adapter[] {
    return this.wallet.adaptors;
  }

  get network(): WalletAdapterNetwork {
    return this.wallet.network;
  }
}
