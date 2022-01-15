import { DependencyService } from './DependencyContext';
import { singleton } from 'tsyringe';

describe('Should test Dependency Context correctly', function () {
  it('Dependency should register and retrieve values correctly', () => {
    const tokenStr = 'test.value.1';
    DependencyService.registerValue(tokenStr, tokenStr);
    const value = DependencyService.resolve<string>(tokenStr);
    expect(value, `should have retrieved a ${tokenStr} from DependencyService`).toEqual(tokenStr);
  });

  it('DependencyService should register and retrieve singletons correctly', () => {
    class SingletonFoo {
      value: string;
      constructor() {
        this.value = '';
      }
    }

    DependencyService.registerSingleton(SingletonFoo);

    const testValue = 'new value';

    const fooInstance1 = DependencyService.resolve<SingletonFoo>(SingletonFoo);
    fooInstance1.value = 'new value';

    const fooInstance2 = DependencyService.resolve<SingletonFoo>(SingletonFoo);
    expect(fooInstance1.value, `Foo1 value ${fooInstance1.value} should === Foo2`).toEqual(
      fooInstance2.value
    );
    expect(fooInstance1, 'Foo1 should actually eq Foo2').toEqual(fooInstance2);
  });

  it('DependencyService should register and retrieve class instances correctly', () => {
    class InstanceFoo {
      value: string;
      constructor() {
        this.value = '';
      }
    }

    DependencyService.registerClass(InstanceFoo);

    const testValue = 'value2';

    const fooInstance1 = DependencyService.resolve<InstanceFoo>(InstanceFoo);
    expect(fooInstance1, `Foo1 ${fooInstance1} should exist`).toBeTruthy();
    fooInstance1.value = testValue;

    const fooInstance2 = DependencyService.resolve<InstanceFoo>(InstanceFoo);
    expect(fooInstance2, `Foo2 ${fooInstance2} should exist`).toBeTruthy();
    expect(
      fooInstance1.value != fooInstance2.value,
      `Foo1 value ${fooInstance1.value} should !== Foo2.value ${fooInstance2.value}`
    ).toBeTruthy();
    expect(fooInstance1 != fooInstance2, 'Foo1 should not eq Foo2').toBeTruthy();
  });
});
