import { ViewModel } from '../ViewModel';
import { WalletModel } from '../../models/WalletModel/WalletModel';
import { CandyMachineModel } from '../../models/CandyMachine/CandyMachineModel';
import { injectable } from 'tsyringe';
import { computed, makeObservable, observable, runInAction } from 'mobx';
import { isEmpty } from 'lodash';

@injectable()
export class CandyMachineInfoViewModel extends ViewModel {
  mintStarted = false;
  mintFinished = false;
  mintError = '';
  mints: Array<string> = [];
  mintAddress: string = '';
  metaDataAddress: string = '';
  masterEditionAddress: string = '';

  constructor(protected walletModel: WalletModel, protected candyMachineModel: CandyMachineModel) {
    super();

    makeObservable(this, {
      mints: observable,
      mintStarted: observable,
      mintFinished: observable,
      mintError: observable,
      mintAddress: observable,
      metaDataAddress: observable,
      masterEditionAddress: observable,
      hasMintError: computed,
      walletConnected: computed,
      userPublicKey: computed,
      isCandyMachineReady: computed,
      itemsAvailable: computed,
      itemsRemaining: computed,
      itemsRedeemed: computed,
      goLiveData: computed,
      goLiveDateTime: computed,
      preSale: computed,
      isActive: computed,
      isSoldOut: computed,
    });
  }

  protected onInitialize(): void {
    this.walletModel.initialize();
    this.candyMachineModel.initialize();
  }

  protected afterReactionsRemoved() {
    this.walletModel.end();
    this.candyMachineModel.end();
  }

  get walletConnected(): boolean {
    return this.walletModel.connected;
  }

  get userPublicKey(): string {
    return this.walletModel.publicKey;
  }

  get isCandyMachineReady(): boolean {
    return this.candyMachineModel.isInitialized;
  }

  get candyMachineId(): string {
    return this.candyMachineModel.candyMachineId;
  }
  get itemsAvailable(): number {
    return this.candyMachineModel.itemsAvailable;
  }
  get itemsRedeemed(): number {
    return this.candyMachineModel.itemsRedeemed;
  }
  get itemsRemaining(): number {
    return this.candyMachineModel.itemsRemaining;
  }
  get goLiveData(): number {
    return this.candyMachineModel.goLiveData;
  }
  get preSale(): boolean {
    return this.candyMachineModel.preSale;
  }
  get goLiveDateTime(): string {
    return this.candyMachineModel.goLiveDateTime;
  }

  get hasMintError(): boolean {
    return !isEmpty(this.mintError);
  }

  get isActive(): boolean {
    return this.candyMachineModel.isActive;
  }

  get isSoldOut(): boolean {
    return this.candyMachineModel.isSoldOut;
  }

  async mintToken() {
    runInAction(() => {
      this.mintStarted = true;
      this.mintFinished = false;
    });

    try {
      const mintResults = await this.candyMachineModel.mintToken();
      runInAction(() => {
        this.mintAddress = mintResults.mintAddress.toString();
        this.metaDataAddress = mintResults.metaDataAddress.toString();
        this.masterEditionAddress = mintResults.masterEditionAddress.toString();
        this.mints = mintResults.tx;
      });
    } catch (e: any) {
      console.error('Error minting token', e);
      runInAction(() => (this.mintError = e.toString()));
    } finally {
      runInAction(() => {
        this.mintStarted = false;
        this.mintFinished = true;
      });
    }
  }
}
