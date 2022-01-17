import {Model} from "../Model";
import {Provider} from "@project-serum/anchor";
import {DependencyService} from "../../services/injection/DependencyContext";
import {DI_KEYS} from "../../core/Constants";
import {Connection} from "@solana/web3.js";
import { get } from 'lodash';
import {singleton} from "tsyringe";


@singleton()
export class SolanaModel extends Model {
    protected _provider:Provider|null = null;
    protected _connection: Connection|null = null;

    protected onInitialize(): void {
        if(typeof window === 'undefined') return;

        this.setUpConnection();
        this.setUpProvider();
    }

    protected onEnd() {
        super.onEnd();
        this._provider = null;
        this._connection = null;
    }

    protected setUpConnection() {
        const rpcHost: string = DependencyService.resolve(DI_KEYS.SOLANA_RPC_HOST);
        if(!rpcHost) throw new Error("~~~ No RPC Host provided by ENV");

        this._connection = new Connection(rpcHost);
    }

    protected setUpProvider() {
        const conn = this.connection;
        const solana = get(window, 'solana');
        if(!solana) throw new Error("~~~ No Solana Object found on window");
        this._provider = new Provider(conn, solana, Provider.defaultOptions());
    }

    get connection(): Connection {
        if(!this._connection)
            this.setUpConnection();

        return this._connection as Connection;
    }

    get provider(): Provider {
        if(!this._provider)
            this.setUpProvider();

        return this._provider as Provider;
    }

}