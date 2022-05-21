import { ObservableReactionContainer } from '../core/ObservableReactionContainer';
import { nanoid } from "nanoid";

export abstract class ViewModel extends ObservableReactionContainer {
  public readonly id = nanoid(10);
}
