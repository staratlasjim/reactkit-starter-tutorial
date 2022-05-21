import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { useDependency } from '../../../services/injection/DependencyService';
import { DI_KEYS } from '../../../core/Constants';
import { Text } from '../../GlobalStyle.style';
import { useViewModel } from '../../../viewmodels/useViewModel';
import { CandyMachineInfoViewModel } from '../../../viewmodels/candymachine/CandyMachineInfoViewModel';
import { CMIViewGeneralInfoContainer, CMIViewMintBtn } from './CandyMachineInfoView.style';
import { nanoid } from 'nanoid';

export const CandyMachineInfoView: FC = observer(() => {
  const candyMachineId = useDependency(DI_KEYS.CANDY_MACHINE_ID);
  const solanaNetwork = useDependency(DI_KEYS.SOLANA_NETWORK);
  const rpcHost = useDependency(DI_KEYS.SOLANA_RPC_HOST);

  const cmVM = useViewModel<CandyMachineInfoViewModel>(CandyMachineInfoViewModel);

  return (
    <>
      <CMIViewGeneralInfoContainer>
        <Text as="h2" size={2}>
          General Info
        </Text>
        <Text size="3">Candy Machine ID: {candyMachineId}</Text>
        <Text size="3">Solana Network: {solanaNetwork}</Text>
        <Text size="3">RPC Host: {rpcHost}</Text>
      </CMIViewGeneralInfoContainer>
      <Text as="h2" size={2}>
        Mint Info
      </Text>
      {!cmVM.walletConnected && <Text size="3">Connect wallet with button above !!!!</Text>}
      {cmVM.walletConnected && !cmVM.isCandyMachineReady && (
        <Text size="3">Waiting for CM to initialize</Text>
      )}
      {cmVM.walletConnected && cmVM.isCandyMachineReady && (
        <>
          <Text size="3">Items Available: {cmVM.itemsAvailable}</Text>
          <Text size="3">Items Remaining: {cmVM.itemsRemaining}</Text>
          <Text size="3">Items Redeemed: {cmVM.itemsRedeemed}</Text>
          <Text size="3">Go Live Date: {cmVM.goLiveDateTime}</Text>
          {cmVM.isActive && !cmVM.isSoldOut && (
            <CMIViewMintBtn onClick={() => cmVM.mintToken()}>Mint NFT</CMIViewMintBtn>
          )}

          {cmVM.isSoldOut && <div>Sold Out 🙊</div>}

          {cmVM.hasMintError && (
            <>
              <Text size="2">Error: {cmVM.mintError}</Text>
            </>
          )}

          {!cmVM.hasMintError && cmVM.mintStarted && (
            <>
              <Text size={'2'}>Minting tokens, please wait...</Text>
            </>
          )}

          {!cmVM.hasMintError && cmVM.mintFinished && (
            <>
              <Text size={'2'}>Mints done:</Text>
              {cmVM.mintAddress && (
                <Text size={'3'} key={nanoid(4)}>
                  Mint: {cmVM.mintAddress}
                </Text>
              )}
              {cmVM.metaDataAddress && (
                <Text size={'3'} key={nanoid(4)}>
                  Meta: {cmVM.metaDataAddress}
                </Text>
              )}
              {cmVM.masterEditionAddress && (
                <Text size={'3'} key={nanoid(4)}>
                  Master: {cmVM.masterEditionAddress}
                </Text>
              )}
              {cmVM.mints.map((value) => (
                <Text size={'3'} key={nanoid(4)}>
                  tx: {value}
                </Text>
              ))}
            </>
          )}
        </>
      )}
    </>
  );
});
