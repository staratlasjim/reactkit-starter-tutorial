import { Model } from '../Model';
import { Notification } from './Notification';
import { action, computed, makeObservable, observable } from 'mobx';
import { memoize, random } from 'lodash';
import Chance from 'chance';
import { singleton } from 'tsyringe';
import { GetDebug, GlobalContextService } from '../../services/injection/GlobalContextService';

const chance = memoize(() => {
  return new Chance();
})();

@singleton()
export class Notifications extends Model {
  protected notificationList: Array<Notification>;
  protected randomNotifier: any;

  constructor() {
    super();
    this.notificationList = observable([]);
    makeObservable(this, {
      notifications: computed,
      addNotification: action.bound,
    });
  }

  protected onInitialize(): void {
    if (this.isSSR) return;

    if (this.isCSR && GlobalContextService.GetDebug())
      console.log('\n\n\t~~~ Client side rendered\n\n');

    this.randomNotifier = setInterval(() => {
      this.addNotification(chance.name(), chance.paragraph());
    }, random(1000, 3000));
  }

  protected afterReactionsRemoved(): void {}

  get notifications(): Array<Notification> {
    if (this.notificationList.length > 0) {
      console.log(`~~~ faefa: ${this.notificationList.length}`);
    }
    return this.notificationList;
  }

  addNotification(name: string, message: string): void {
    const notification = new Notification();
    notification.setData(name, message);
    if (GetDebug()) console.log(`~~~ Notification ${name} just added`);
    this.notificationList.push(notification);
  }
}
