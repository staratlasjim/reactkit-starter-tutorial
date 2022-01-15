import { IReactionDisposer } from 'mobx';

export abstract class ViewModel {
  protected initCount = 0;
  protected reactions: Array<IReactionDisposer>;

  constructor() {
    this.reactions = [];
  }

  initialize() {
    if (this.initCount > 0) return;
    this.initCount += 1;
    this.onInitialize();
  }

  end() {
    if (this.initCount > 0) {
      this.initCount -= 1;
      return;
    }
    this.reactions.forEach((disposer) => {
      disposer();
    });
    this.reactions = [];
    this.onEnd();
  }

  protected abstract onInitialize(): void;
  protected abstract onEnd(): void;
}
