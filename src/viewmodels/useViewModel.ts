import { DependencyContainer, InjectionToken, instanceCachingFactory } from 'tsyringe';
import { useContext, useEffect, useState } from 'react';
import { DependencyService } from "../services/injection/DependencyService";
import { ViewModel } from './ViewModel';
import constructor from 'tsyringe/dist/typings/types/constructor';

export const useViewModel = <T extends ViewModel>(token: constructor<T>) => {
  let vm = DependencyService.resolveSafe(token) as T;
  if (!vm) {
    DependencyService.container().register(token, {
      useFactory: instanceCachingFactory((dependencyContainer: DependencyContainer) => {
        return new token();
      }),
    });
    vm = DependencyService.resolve(token);
  }

  const [viewModel] = useState(vm);

  viewModel.initialize();

  useEffect(() => {
    return () => {
      viewModel.end();
    };
  }, []);

  return viewModel;
};
