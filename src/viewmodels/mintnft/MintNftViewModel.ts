import { Model } from '../../models/Model';
import { MetaPlexModel } from '../../models/MetaPlex/MetaPlexModel';
import { singleton } from 'tsyringe';
import { computed, makeAutoObservable, makeObservable, runInAction } from 'mobx';
import { nanoid } from 'nanoid';
import { sortBy } from 'lodash';
import { SolanaModel } from '../../models/Solana/SolanaModel';

export interface MintNftStatusMessage {
  msg: string;
  key: string;
}

@singleton()
export class MintNftViewModel extends Model {
  protected data = {
    statusMessages: new Array<MintNftStatusMessage>(),
    hasStarted: false,
    hasFinished: false,
  };
  constructor(protected metaPlex: MetaPlexModel, protected solana: SolanaModel) {
    super();
    makeObservable(this, {
      statusMessages: computed,
    });

    this.data = makeAutoObservable(this.data);
  }
  protected onInitialize(): void {
    this.metaPlex.initialize();
  }

  protected afterReactionsRemoved(): void {
    this.metaPlex.end();
  }

  public onMintButtonClick(event: CustomEvent): void {
    this.addStatusMsg(`~~~~ MintButton Clicked: ${event.detail.id}`);
    this.addStatusMsg(`~~~ Going to mint nft`);
    this.mintNft();
  }

  protected mintNft() {
    this.setHasStarted(true);
    this.metaPlex
      .mintNft()
      .then((results) => {
        this.addStatusMsg(`~~~ Got back mint nft response: ${results.txId}`);
        this.addStatusMsg(`~~~ mint: ${results.mint}`);
        return this.solana.confirmTransaction(results.txId, (msg) => this.addStatusMsg(msg));
      })
      .then((value) => {
        this.addStatusMsg(`~~~ Minted confirmed: ${value ? 'YES' : 'NO'}`);
      })
      .catch((e: any) => this.addStatusMsg(`Error: ${e.toString()}`))
      .finally(() => {
        this.setHasStarted(false);
        this.setHasFinished(true);
      });
  }

  public transferNFT(): void {
    this.setHasStarted(true);
    this.metaPlex
      .transferToAnotherWallet()
      .then((results) => {
        this.addStatusMsg(`~~~ Got back transfer nft response txid: ${results}`);
        return this.solana.confirmTransaction(results, (msg) => this.addStatusMsg(msg));
      })
      .then((value) => {
        this.addStatusMsg(`~~~ transfer confirmed: ${value ? 'YES' : 'NO'}`);
      })
      .catch((e: any) => this.addStatusMsg(`Transfer Error: ${e.toString()}`))
      .finally(() => {
        this.setHasStarted(false);
        this.setHasFinished(true);
      });
  }

  protected addStatusMsg(msg: string): void {
    const newMsgs = [...this.data.statusMessages];
    newMsgs.push({ msg, key: nanoid(4) });
    runInAction(() => {
      this.data.statusMessages = newMsgs;
    });
  }

  get statusMessages(): Array<MintNftStatusMessage> {
    return sortBy(this.data.statusMessages, ['key']);
  }

  get hasStarted(): boolean {
    return this.data.hasStarted;
  }

  get hasFinished(): boolean {
    return this.data.hasFinished;
  }

  protected setHasStarted(hasStarted: boolean): void {
    runInAction(() => {
      this.data.hasStarted = hasStarted;
    });
  }

  protected setHasFinished(hasFinished: boolean): void {
    runInAction(() => {
      this.data.hasFinished = hasFinished;
    });
  }
}
