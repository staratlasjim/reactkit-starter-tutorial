import React, { useContext } from 'react';
import '@abraham/reflection';
import { container, DependencyContainer, InjectionToken, Lifecycle } from 'tsyringe';
import constructor from 'tsyringe/dist/typings/types/constructor';

// TODO: deal with server vs client side context here
//export const DependencyService = container;

export class DependencyService {
  static registerValue<T extends unknown>(token: InjectionToken<T>, value: T): DependencyContainer {
    return container.register(token, { useValue: value });
  }

  static registerSingleton<T extends unknown>(token: constructor<T>): DependencyContainer {
    return container.registerSingleton(token);
  }

  static registerAsSingleton<T extends unknown>(
    from: InjectionToken<T>,
    to: InjectionToken<T>
  ): DependencyService {
    return container.registerSingleton(from, to);
  }

  static registerClass<T extends unknown>(token: constructor<T>): DependencyContainer {
    return container.register(token, { useClass: token }, { lifecycle: Lifecycle.Transient });
  }

  static resolve<T extends unknown>(token: InjectionToken<T>): T {
    return container.resolve(token);
  }

  static container(): DependencyContainer {
    return container;
  }
}

const DependencyContext = React.createContext<DependencyContainer>(container);

export const useDependency = <T extends unknown>(token: InjectionToken<T>) => {
  const container = useContext(DependencyContext);
  return container.resolve(token) as T;
};

export default DependencyContext;
