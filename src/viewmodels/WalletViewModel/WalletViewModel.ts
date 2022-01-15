import { computed, makeObservable } from 'mobx';
import { WalletModel } from '../../models/WalletModel/WalletModel';
import { DependencyService } from '../../services/injection/DependencyContext';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ViewModel } from '../ViewModel';

export class WalletViewModel extends ViewModel {
  wallet: WalletModel;

  constructor() {
    super();
    this.wallet = DependencyService.resolve(WalletModel);
    makeObservable(this, {
      connected: computed,
      name: computed,
      publicKey: computed,
      adaptors: computed,
      network: computed,
    });
  }

  protected onInitialize(): void {}
  protected onEnd(): void {}

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
