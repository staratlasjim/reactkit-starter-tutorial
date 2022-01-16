import {
  renderHook,
  WaitForNextUpdateOptions,
  WaitForOptions,
  WaitForValueToChangeOptions,
} from '@testing-library/react-hooks';
import { ViewModel } from '../viewmodels/ViewModel';
import { useViewModel } from '../viewmodels/useViewModel';
import { constructor } from 'tsyringe/dist/typings/types';

export type GetViewModelForTestReturnType<T> = {
  waitForNextUpdate: (options?: WaitForNextUpdateOptions) => Promise<void>;
  unmount: () => void;
  vm: T;
  waitForValueToChange: (
    selector: () => unknown,
    options?: WaitForValueToChangeOptions
  ) => Promise<void>;
  waitFor: (callback: () => boolean | void, options?: WaitForOptions) => Promise<void>;
  rerender: (props?: unknown) => void;
};

export function getViewModelForTest<T extends ViewModel>(
  key: constructor<T>
): GetViewModelForTestReturnType<T> {
  const { unmount, result, rerender, waitFor, waitForNextUpdate, waitForValueToChange } =
    renderHook(() => useViewModel<T>(key));
  if (!result || !result.current)
    throw new Error(`Unable to get view model ${key.name} from renderhook`);
  const vm: T = result.current as T;
  return { vm, unmount, rerender, waitFor, waitForNextUpdate, waitForValueToChange };
}
