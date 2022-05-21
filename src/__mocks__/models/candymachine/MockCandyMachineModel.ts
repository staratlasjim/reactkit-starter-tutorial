import {
  CandyMachineAccount,
  CandyMachineModel,
  ICandyMachineModel,
} from '../../../models/CandyMachine/CandyMachineModel';
import { delayExec } from '../../../utils/PromiseUtils';
import dayjs from 'dayjs';
import {
  IWalletAdaptorService,
  WalletAdaptorService,
} from '../../../services/WalletAdaptorService/WalletAdaptorService';
import { DependencyService } from '../../../services/injection/DependencyService';
import { MockWalletAdaptor, MockWalletAdaptorName } from '../../services/MockWalletAdaptor';
import { injectable } from 'tsyringe';
import { DI_KEYS } from '../../../core/Constants';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BN, Program } from '@project-serum/anchor';

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

  async getCandyMachineState(): Promise<CandyMachineAccount | null> {
    if (typeof window === 'undefined') return null;
    return delayExec(() => {
      this.itemsAvailable = 10;
      this.itemsRedeemed = 5;
      this.itemsRemaining = 5;
      this.goLiveData = dayjs().subtract(10, 'day').toDate().getTime();
      this.preSale = true;

      // We will be using this later in our UI so let's generate this now
      this.goLiveDateTime = `${new Date(this.goLiveData * 1000).toUTCString()}`;

      this.candyMachineState = {
        id: new PublicKey(this.candyMachineId),
        program: {} as Program,
        state: {
          itemsAvailable: this.itemsAvailable,
          itemsRedeemed: this.itemsRedeemed,
          itemsRemaining: this.itemsRemaining,
          isSoldOut: this.itemsRemaining === 0,
          isActive: true,
          isPresale: this.preSale,
          goLiveDate: new BN(this.goLiveData),
          treasury: new Keypair().publicKey,
          tokenMint: new Keypair().publicKey,
          gatekeeper: null,
          endSettings: null,
          whitelistMintSettings: null,
          hiddenSettings: null,
          price: new BN(0.1),
        },
      };

      return this.candyMachineState;
    }, 400);
  }
}
