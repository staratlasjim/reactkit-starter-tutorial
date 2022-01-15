import { LifeCycleObject } from './LifeCycleObject';
import { IReactionDisposer } from 'mobx';

export abstract class ReactionContainer extends LifeCycleObject {
  protected reactions: Array<IReactionDisposer>;

  constructor() {
    super();
    this.reactions = [];
  }

  protected onEnd() {
    this.reactions.forEach((disposer) => {
      disposer();
    });
    this.reactions = [];
  }
}
