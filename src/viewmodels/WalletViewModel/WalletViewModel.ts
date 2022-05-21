import { computed, makeObservable, observable } from 'mobx';
import { WalletModel } from '../../models/WalletModel/WalletModel';
import { Adapter, WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { ViewModel } from '../ViewModel';
import { injectable } from 'tsyringe';
import { Notifications } from '../../models/Notifications/Notifications';
import { Notification } from '../../models/Notifications/Notification';

@injectable()
export class WalletViewModel extends ViewModel {
  constructor(protected wallet: WalletModel, protected _notifications: Notifications) {
    super();

    makeObservable(this, {
      connected: computed,
      name: computed,
      publicKey: computed,
      adaptors: computed,
      network: computed,
      notifications: computed,
    });
  }

  protected onInitialize(): void {
    this.wallet.initialize();
    this._notifications.initialize();
  }
  protected afterReactionsRemoved(): void {
    this.wallet.end();
    this._notifications.end();
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

  get notifications(): Array<Notification> {
    if (this._notifications.notifications.length > 0) {
      console.log(`~~~ Notifications: ${this._notifications.notifications.length}`);
    }

    return this._notifications.notifications;
  }

  get walletModel(): WalletModel {
    return this.wallet;
  }
}
