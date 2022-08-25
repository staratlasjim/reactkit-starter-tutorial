import { ObservableReactionContainer } from '../core/ObservableReactionContainer';
import { nanoid } from 'nanoid';

export abstract class ViewModel extends ObservableReactionContainer {
  public abstract onLayoutEffect(config?: any): void;
  public abstract onEffect(config?: any): void;
  public abstract onLayoutEffectUnmount(): void;
  public abstract onEffectUnmount(): void;
}
