import React, { FC, useMemo } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton,
} from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';
import { observer } from 'mobx-react-lite';
import { WalletViewModel } from '../../../viewmodels/WalletViewModel/WalletViewModel';
import { useViewModel } from '../../../viewmodels/useViewModel';

// Default styles that can be overridden by your app
require('@solana/wallet-adapter-react-ui/styles.css');

export const WalletConnectView: FC = observer(({ children }) => {
  const wallet = useViewModel<WalletViewModel>(WalletViewModel);
  console.log('wallet: ', wallet);
  const network = wallet.network;

  const endpoint = useMemo(() => clusterApiUrl(network), [network]);
  const wallets = wallet.adaptors;

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletMultiButton />
          <WalletDisconnectButton />
          {/* Your app's components go here, nested within the context providers. */}
          <div>
            <p>Wallet connected: {wallet.connected ? 'yep' : 'nope'}</p>
          </div>
          {wallet.connected && (
            <>
              <p>Wallet Name: {wallet.name}</p>
              <p>Public Key: {wallet.publicKey}</p>
            </>
          )}
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
});
