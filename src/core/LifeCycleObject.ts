export abstract class LifeCycleObject {
  protected initGuard = 0;

  initialize() {
    ++this.initGuard;
    if (this.initGuard > 1) {
      return;
    }

    this.onInitialize();
  }

  end() {
    --this.initGuard;
    if (this.initGuard > 0) {
      return;
    }
    this.initGuard = 0;
    this.onEnd();
  }

  protected abstract onInitialize(): void;
  protected abstract onEnd(): void;
}
