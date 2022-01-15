import type { AppProps } from 'next/app';
import DependencyContext, { DependencyService } from '../services/injection/DependencyContext';

import { enableStaticRendering } from 'mobx-react-lite';
import { WalletModel } from '../models/WalletModel/WalletModel';
// there is no window object on the server
enableStaticRendering(typeof window === 'undefined');

const walletModel = DependencyService.resolve<WalletModel>(WalletModel);
console.log(`~~~ WalletModel ${walletModel}`, walletModel);

function NftMeApp({ Component, pageProps }: AppProps) {
  return (
    <DependencyContext.Provider value={DependencyService.container()}>
      <Component {...pageProps} />
    </DependencyContext.Provider>
  );
}

export default NftMeApp;
