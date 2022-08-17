/**
 * Object which helps manage life cycle calls, should be the base class for items that deal with life cycles, such
 * as React view life cycle, or network life cycle class.
 */
import { nanoid } from 'nanoid';
import { get, hasIn, pull } from 'lodash';
import { InjectionToken } from 'tsyringe';
import { GlobalContextService } from '../services/injection/GlobalContextService';
import DependencyService from '../services/injection/DependencyService';

export abstract class LifeCycleObject {
  protected _id: string;
  protected initGuard = 0;
  protected _isSSR = true;

  protected dependencies: Array<any>;

  protected constructor() {
    this._id = nanoid(10);
    this._isSSR = GlobalContextService.Get().isSSR;
    this.dependencies = new Array<any>();
  }

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

  get isSSR(): boolean {
    return this._isSSR;
  }

  get isCSR(): boolean {
    return !this._isSSR;
  }

  get id(): string {
    return this._id;
  }

  protected abstract onInitialize(): void;
  protected abstract onEnd(): void;

  /**
   * Should only be used in the constructor of an object
   * - this system utilizes the life cycle to initialize a
   * dependency.
   * @param token
   */
  public addDependency<T>(token: InjectionToken<T>): T {
    const depObj = DependencyService.resolve(token);
    this.dependencies.push(depObj);

    return depObj as T;
  }

  public removeDependency(token: InjectionToken<any>): void {
    const depObj = DependencyService.resolveSafe(token);
    if (!depObj) {
      throw new Error(`Unable to resolve ${String(token)}`);
    }

    if (this.dependencies.find((value) => value === depObj)) {
      const isLifeCycleObj = hasIn(depObj, 'initialize') && hasIn(depObj, 'end');

      if (isLifeCycleObj) {
        const end = get(depObj, 'end').bind(depObj);
        end();
      }

      pull(this.dependencies, depObj);
    }
  }

  protected initializeDependencies(): void {
    this.dependencies.forEach((value) => {
      const isLifeCycleObj = hasIn(value, 'initialize') && hasIn(value, 'end');

      if (isLifeCycleObj) {
        const initialize = get(value, 'initialize').bind(value);
        initialize();
      }
    });
  }

  protected removeDependencies(): void {
    const oldList = this.dependencies;
    this.dependencies = [];
    oldList.forEach((value) => {
      const isLifeCycleObj = hasIn(value, 'initialize') && hasIn(value, 'end');

      if (isLifeCycleObj) {
        const end = get(value, 'end').bind(value);
        end();
      }
    });
  }
}
