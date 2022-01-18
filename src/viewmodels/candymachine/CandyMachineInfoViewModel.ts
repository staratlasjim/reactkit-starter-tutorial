import {ViewModel} from "../ViewModel";
import {WalletModel} from "../../models/WalletModel/WalletModel";
import {CandyMachineModel} from "../../models/CandyMachine/CandyMachineModel";
import {injectable} from "tsyringe";
import {computed, makeObservable} from "mobx";

@injectable()
export class CandyMachineInfoViewModel extends ViewModel {

    constructor(protected walletModel: WalletModel, protected candyMachineModel: CandyMachineModel) {
        super();

        makeObservable(this, {
            walletConnected: computed,
            userPublicKey: computed,
            isCandyMachineReady: computed,
            itemsAvailable: computed,
            itemsRemaining: computed,
            itemsRedeemed: computed,
            goLiveData: computed,
            goLiveDateTime: computed,
            preSale: computed
        })
    }

    protected onInitialize(): void {
        this.walletModel.initialize();
        this.candyMachineModel.initialize();
    }

    protected onEnd() {
        super.onEnd();
        this.walletModel.end();
        this.candyMachineModel.end();
    }

    get walletConnected(): boolean {
        return this.walletModel.connected;
    }

    get userPublicKey(): string {
        return this.walletModel.publicKey
    }

    get isCandyMachineReady(): boolean {
        return this.candyMachineModel.isInitialized;
    }

    get candyMachineId(): string{
        return this.candyMachineModel.candyMachineId;
    }
    get itemsAvailable(): number {
        return this.candyMachineModel.itemsAvailable;
    }
    get itemsRedeemed():number{
        return this.candyMachineModel.itemsRedeemed;
    }
    get itemsRemaining():number{
        return this.candyMachineModel.itemsRemaining;
    }
    get goLiveData():number{
        return this.candyMachineModel.goLiveData;
    }
    get preSale():number{
        return this.candyMachineModel.preSale;
    }
    get goLiveDateTime(): string{
        return this.candyMachineModel.goLiveDateTime;
    }
}