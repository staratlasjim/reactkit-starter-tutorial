import type { AppProps } from 'next/app';
import DependencyService from '../services/injection/DependencyService';
import { DI_KEYS } from '../core/Constants';

import { enableStaticRendering } from 'mobx-react-lite';
// there is no window object on the server
enableStaticRendering(typeof window === 'undefined');

const candyMachineId = process.env.NEXT_PUBLIC_REACT_APP_CANDY_MACHINE_ID;
const solanaNetwork = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_NETWORK;
const solanaRpcHost = process.env.NEXT_PUBLIC_REACT_APP_SOLANA_RPC_HOST;

console.log('~~~ Index Props: ', candyMachineId, solanaNetwork, solanaRpcHost);
DependencyService.registerValue(DI_KEYS.CANDY_MACHINE_ID, candyMachineId);
DependencyService.registerValue(DI_KEYS.SOLANA_NETWORK, solanaNetwork);
DependencyService.registerValue(DI_KEYS.SOLANA_RPC_HOST, solanaRpcHost);

function NftMeApp({ Component, pageProps }: AppProps) {
  return (
      <Component {...pageProps} />
  );
}

export default NftMeApp;
