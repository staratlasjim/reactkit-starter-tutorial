import type { AppProps } from 'next/app';
import DependencyContext, { DependencyService } from '../services/injection/DependencyContext';

import { enableStaticRendering } from 'mobx-react-lite';
// there is no window object on the server
enableStaticRendering(typeof window === 'undefined');

function NftMeApp({ Component, pageProps }: AppProps) {
  return (
    <DependencyContext.Provider value={DependencyService.container()}>
      <Component {...pageProps} />
    </DependencyContext.Provider>
  );
}

export default NftMeApp;
