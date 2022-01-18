import {
  CandyMachineModel,
  ICandyMachineModel,
} from '../../../models/CandyMachine/CandyMachineModel';
import { delayExec } from '../../../utils/PromiseUtils';
import dayjs from 'dayjs';
import {
  IWalletAdaptorService,
  WalletAdaptorService,
} from '../../../services/WalletAdaptorService/WalletAdaptorService';
import { DependencyService } from '../../../services/injection/DependencyContext';
import { MockWalletAdaptor, MockWalletAdaptorName } from '../../services/MockWalletAdaptor';
import { injectable } from 'tsyringe';
import { DI_KEYS } from '../../../core/Constants';

@injectable()
export class MockCandyMachineModel extends CandyMachineModel implements ICandyMachineModel {
  static SetMockModel() {
    DependencyService.registerValue(DI_KEYS.CANDY_MACHINE_ID, 'TEST111');
    DependencyService.registerAsSingleton(CandyMachineModel, MockCandyMachineModel);
  }
  static RestoreOriginalModel() {
    DependencyService.registerAsSingleton(CandyMachineModel, CandyMachineModel);
  }

  static GetMockModel(config: any = {}): ICandyMachineModel {
    return DependencyService.resolve<MockCandyMachineModel>(MockCandyMachineModel);
  }

  async getCandyMachineState(): Promise<void> {
    if (typeof window === 'undefined') return;
    return delayExec(() => {
      this._candyMachineInfo = null;
      this.itemsAvailable = 10;
      this.itemsRedeemed = 5;
      this.itemsRemaining = 5;
      this.goLiveData = dayjs().subtract(10, 'day').toDate().getTime();
      this.preSale = 100;

      // We will be using this later in our UI so let's generate this now
      this.goLiveDateTime = `${new Date(this.goLiveData * 1000).toUTCString()}`;
    }, 400);
  }
}
