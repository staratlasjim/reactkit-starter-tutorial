import { renderHook } from '@testing-library/react-hooks';
import { observable, runInAction } from 'mobx';
import { singleton } from 'tsyringe';
import { get } from 'lodash';
import { ViewModel } from './ViewModel';
import { getMountCount, getReactInitKey, hasReactInitKey, useViewModel } from './useViewModel';
import { GlobalContextService } from '../services/injection/GlobalContextService';
import DependencyService from '../services/injection/DependencyService';

@singleton()
// @ts-ignore
class TestViewModel extends ViewModel {
  protected data = {
    afterMount: false,
    beforeMount: false,
    didUnmount: false,
    end: false,
    init: false,

    afterMountCount: 0,
    beforeMountCount: 0,
    unmountCount: 0,
    endCount: 0,
    initCount: 0,
  };

  constructor() {
    super();
    this.data = observable(this.data);
  }

  public reset(): void {
    runInAction(() => {
      this.data.init = false;
      this.data.initCount = 0;

      this.data.beforeMount = false;
      this.data.beforeMountCount = 0;

      this.data.afterMount = false;
      this.data.afterMountCount = 0;

      this.data.didUnmount = false;
      this.data.unmountCount = 0;

      this.data.end = false;
      this.data.endCount = 0;
    });
  }

  protected onInitialize(config?: any): void {
    if (config ?? get(config, 'reset')) {
      this.reset();
    }

    runInAction(() => {
      this.data.init = true;
      this.data.initCount += 1;
    });
  }

  onLayoutEffect(config?: any): void {
    runInAction(() => {
      this.data.beforeMount = true;
      this.data.beforeMountCount += 1;
    });
  }

  onLayoutEffectUnmount(): void {}

  onEffect(config?: any): void {
    runInAction(() => {
      this.data.afterMount = true;
      this.data.afterMountCount += 1;
    });
  }

  onEffectUnmount(): void {
    runInAction(() => {
      this.data.didUnmount = true;
      this.data.unmountCount += 1;
    });
  }

  protected onEnd(config?: any): void {
    runInAction(() => {
      this.data.end = true;
      this.data.endCount += 1;
    });
  }

  get endCalled(): boolean {
    return this.data.end;
  }

  get endCount(): number {
    return this.data.endCount;
  }

  get initCalled(): boolean {
    return this.data.init;
  }

  get initCount(): number {
    return this.data.initCount;
  }

  get afterCalled(): boolean {
    return this.data.afterMount;
  }

  get afterCount(): number {
    return this.data.afterMountCount;
  }

  get beforeCalled(): boolean {
    return this.data.beforeMount;
  }

  get beforeCount(): number {
    return this.data.beforeMountCount;
  }

  get didUnmount(): boolean {
    return this.data.didUnmount;
  }

  get unmountCount(): number {
    return this.data.unmountCount;
  }
}

describe('ReactKit Hooks should work correctly', () => {
  afterEach(() => {
    const testVM = DependencyService.resolve(TestViewModel);
    testVM.reset();
  });

  test('useViewModel should get back the ViewModel with isSSR set to true (window exists on these unit tests)', () => {
    const dependency = renderHook(() => useViewModel<TestViewModel>(TestViewModel));
    expect(dependency).toBeTruthy();
    expect(dependency.result.current).toBeTruthy();
    expect(dependency.result.current.isSSR).toEqual(GlobalContextService.Get().isSSR);
    dependency.unmount();
  });

  test('useViewModel should get back the ViewModel with life cycle calls correctly called', () => {
    const dependency = renderHook(() => useViewModel<TestViewModel>(TestViewModel));
    const vm = dependency.result.current;

    expect(dependency).toBeTruthy();
    expect(dependency.result.current).toBeTruthy();
    expect(dependency.result.current.isSSR).toEqual(GlobalContextService.Get().isSSR);

    expect(vm.initCalled).toBeTruthy();
    expect(vm.initCount, 'init should be 1').toBe(1);

    expect(vm.afterCalled).toBeTruthy();
    expect(vm.afterCount, 'afterCount should be 1').toBe(1);

    expect(vm.beforeCalled).toBeTruthy();
    expect(vm.beforeCount, 'beforeCount should be 1').toBe(1);

    expect(vm.endCalled).toBeFalsy();
    expect(vm.endCount, 'end should be 0').toBe(0);

    expect(hasReactInitKey(vm), 'should have react key').toBeTruthy();

    dependency.unmount();

    expect(vm.didUnmount, 'should have called unmount').toBeTruthy();
    expect(vm.unmountCount, 'unmount should be 1').toBe(1);

    expect(vm.endCalled).toBeTruthy();
    expect(vm.endCount, 'end should be 1').toBe(1);
  });

  test('useViewModel should work with react key to only initialize once correctly', () => {
    const dependency = renderHook(() => useViewModel<TestViewModel>(TestViewModel));
    const vm = dependency.result.current;
    expect(dependency).toBeTruthy();
    expect(dependency.result.current).toBeTruthy();

    expect(hasReactInitKey(vm), 'should have react key').toBeTruthy();
    const reactKey = getReactInitKey(vm);
    expect(reactKey).toBeTruthy();
    let mountCount = getMountCount(vm);
    expect(mountCount, 'mount count should be 1').toBe(1);
    expect(vm.initCount, 'should only be initialized once').toBe(1);

    dependency.rerender();
    const vmRerender = dependency.result.current;
    expect(vmRerender.didUnmount, 'should not-have called unmount').toBeFalsy();
    expect(vmRerender.unmountCount, 'unmount should be 0').toBe(0);

    mountCount = getMountCount(vm);
    expect(mountCount, 'mount count should still be 1').toBe(1);
    expect(mountCount, 'mount count should equal previous').toBe(getMountCount(vmRerender));
    expect(reactKey, 'react key should not have changed').toBe(getReactInitKey(vmRerender));
    expect(vm.initCount, 'init should be 1').toBe(1);
    expect(vmRerender.initCount, 'init should not have changed').toBe(vm.initCount);

    expect(vmRerender.beforeCount, 'should have mounted 1').toBe(1);

    dependency.unmount();
    expect(vmRerender.didUnmount, 'should not-have called unmount').toBeTruthy();
    expect(vmRerender.unmountCount, 'unmount should be 3').toBe(1);

    mountCount = getMountCount(vm);
    expect(mountCount, 'mount count should now be 0').toBe(0);
    expect(vm.endCalled).toBeTruthy();
    expect(vm.endCount, 'end should be 1').toBe(1);
    expect(reactKey, 'react key should have changed').not.toBe(
      getReactInitKey(dependency.result.current)
    );
    expect(hasReactInitKey(dependency.result.current)).toBeFalsy();
  });

  test('useViewModel should work with multiple mounts correctly', () => {
    const dependency = renderHook(() => useViewModel<TestViewModel>(TestViewModel));
    expect(dependency).toBeTruthy();
    expect(dependency.result.current).toBeTruthy();

    const vm = dependency.result.current;
    dependency.rerender();

    const d2 = renderHook(() => useViewModel<TestViewModel>(TestViewModel));
    expect(
      get(d2.result.current, 'initGuard'),
      'TestViewModel should still have been initGuard of 1 because it was only initialized once'
    ).toBe(1);

    expect(d2.result.current.initCount, 'should have still only been initialized once').toBe(1);

    dependency.unmount();

    // init guard should not have ended this object yet
    expect(vm.endCalled).toBeFalsy();
    expect(vm.endCount, 'end should be 0').toBe(0);

    d2.unmount();

    expect(vm.endCalled).toBeTruthy();
    expect(vm.endCount, 'end should be 1').toBe(1);
    expect(hasReactInitKey(d2.result.current), 'should not have react key').toBeFalsy();
  });
});
