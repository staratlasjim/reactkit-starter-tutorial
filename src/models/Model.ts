import { ObservableReactionContainer } from '../core/ObservableReactionContainer';
import { nanoid } from 'nanoid';

export abstract class Model extends ObservableReactionContainer {
  public readonly id = nanoid(10);
}
