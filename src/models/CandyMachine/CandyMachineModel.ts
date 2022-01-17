import {Model} from "../Model";
import {singleton} from "tsyringe";
import {SolanaModel} from "../Solana/SolanaModel";
import {action, makeObservable, observable} from "mobx";
import {DI_KEYS} from "../../core/Constants";
import {Program, web3} from "@project-serum/anchor";
import {DependencyService} from "../../services/injection/DependencyContext";
import {isEmpty} from "lodash";

@singleton()
export class CandyMachineModel extends Model {
    static readonly CandyMachineProgramAddress = new web3.PublicKey(
        'cndy3Z4yapfJBmL3ShUp5exZKqR3z33thTzeNMm2gRZ'
    );
    isInitialized = false;
    candyMachineId: string;
    itemsAvailable = 0;
    itemsRedeemed = 0;
    itemsRemaining = 0;
    goLiveData = 0;
    preSale = 0;
    goLiveDateTime = "";

    protected _candyMachineInfo:unknown;

    constructor(protected solanaModel: SolanaModel) {
        super();
        this.candyMachineId = DependencyService.resolve(DI_KEYS.CANDY_MACHINE_ID);
        makeObservable(this, {
            isInitialized: observable,
            itemsAvailable: observable,
            itemsRedeemed: observable,
            itemsRemaining: observable,
            goLiveData: observable,
            preSale: observable,
            goLiveDateTime: observable,
            getCandyMachineState: action.bound
        })
    }

    protected onInitialize(): void {
        this.isInitialized = false;
        this.getCandyMachineState().then(()=>this.isInitialized = true);
    }

    public async getCandyMachineState() {
        if(typeof window === 'undefined') return;

        const candyMachineProgramId = CandyMachineModel.CandyMachineProgramAddress

        if(!this.candyMachineId || isEmpty(this.candyMachineId)) throw new Error("Error: No candy machine id")
        const provider = this.solanaModel.provider;

        const idl = await Program.fetchIdl(candyMachineProgramId, provider);
        if(!idl) throw new Error(`Unable to fetch idl for ${candyMachineProgramId}`);

        const program = new Program(idl, candyMachineProgramId, provider);
        const candyMachine = await program.account.candyMachine.fetch(this.candyMachineId);

        if(!candyMachine) throw new Error(`Unable to fetch candyMachineInfo for ${this.candyMachineId}`);

        this._candyMachineInfo = candyMachine;
        this.itemsAvailable = candyMachine.data.itemsAvailable.toNumber();
        this.itemsRedeemed = candyMachine.itemsRedeemed.toNumber();
        this.itemsRemaining = this.itemsAvailable - this.itemsRedeemed;
        this.goLiveData = candyMachine.data.goLiveDate.toNumber();
        this.preSale =
            candyMachine.data.whitelistMintSettings &&
            candyMachine.data.whitelistMintSettings.presale &&
            (!candyMachine.data.goLiveDate ||
                candyMachine.data.goLiveDate.toNumber() > new Date().getTime() / 1000);

        // We will be using this later in our UI so let's generate this now
        this.goLiveDateTime = `${new Date(this.goLiveData * 1000).toUTCString()}`;

        this.logData();
    }

    public logData() {
        console.log(
            this.itemsAvailable,
            this.itemsRedeemed,
            this.itemsRemaining,
            this.goLiveData,
            this.goLiveDateTime,
            this.preSale,
        );
    }

}