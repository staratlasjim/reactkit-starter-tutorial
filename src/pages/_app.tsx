import type { AppProps } from 'next/app';
import { Wallet } from '../components/solanawallet/Wallet';
import DependencyContext, { DependencyService } from '../services/injection/DependencyContext';

function NftMeApp({ Component, pageProps }: AppProps) {
  return (
    <DependencyContext.Provider value={DependencyService.container()}>
      <Wallet>
        <Component {...pageProps} />
      </Wallet>
    </DependencyContext.Provider>
  );
}

export default NftMeApp;
