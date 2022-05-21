import { Model } from "../Model";
import { action, computed, makeAutoObservable, makeObservable, runInAction } from "mobx";

type NodificationData = {
  name: string;
  msg: string;
}

export class Notification extends Model {
  protected data: NodificationData;

  constructor() {
    super();
    this.data = makeAutoObservable({ name: '', msg: ''});

    makeObservable(this, {
      name: computed,
      msg: computed,
      setData: action.bound,
      setName: action.bound,
      setMessage: action.bound,
    })
  }

  protected afterReactionsRemoved(): void {
    runInAction(()=> {
      this.data.name = "";
      this.data.msg = "";
    })
  }

  protected onInitialize(): void {
  }

  get name(): string {
    return this.data.name;
  }

  get msg(): string {
    return this.data.msg;
  }

  public setData(name: string, msg: string) {
    this.data.name = name;
    this.data.msg = msg;
  }

  setName(name:string): void {
    this.data.name = name;
  }

  setMessage(msg: string): void {
    this.data.msg = msg;
  }
}
