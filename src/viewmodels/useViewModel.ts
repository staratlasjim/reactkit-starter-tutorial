import { DependencyContainer, InjectionToken, instanceCachingFactory } from 'tsyringe';
import { useContext, useEffect, useState } from 'react';
import DependencyContext from '../services/injection/DependencyContext';
import { ViewModel } from './ViewModel';
import constructor from 'tsyringe/dist/typings/types/constructor';

export const useViewModel = <T extends ViewModel>(token: constructor<T>) => {
  const container = useContext(DependencyContext);
  const vm = container.resolve(token) as T;
  if (!vm) {
    container.register(token, {
      useFactory: instanceCachingFactory((dependencyContainer: DependencyContainer) => {
        return new token();
      }),
    });
  }

  const [viewModel] = useState(vm);

  viewModel.initialize();

  useEffect(() => {
    return () => {
      vm.end();
    };
  }, []);

  return viewModel;
};
