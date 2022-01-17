import { FC } from 'react';
import { observer } from 'mobx-react-lite';
import { useDependency } from '../../../services/injection/DependencyContext';
import { DI_KEYS } from '../../../core/Constants';
import { Text } from '../../GlobalStyle.style';
import { useViewModel } from '../../../viewmodels/useViewModel';
import { CandyMachineInfoViewModel } from '../../../viewmodels/candymachine/CandyMachineInfoViewModel';
import { CMIViewGeneralInfoContainer } from './CandyMachineInfoView.style';

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
        </>
      )}
    </>
  );
});
