import type { NextPage } from 'next';
import { AppBodyContainer } from '../ui/GlobalStyle.style';
import { DisplayNftInfoView } from '../ui/views/DisplayNftInfoView/DisplayNftInfoView';
import { useViewModel } from '../viewmodels/useViewModel';
import { WalletViewModel } from '../viewmodels/WalletViewModel/WalletViewModel';
import { observer } from 'mobx-react-lite';
import { useEffectOnce } from 'react-use';
import { queueProcessor } from 'mobx-utils';

const DisplayNft: NextPage = observer(() => {
  const walletVM = useViewModel(WalletViewModel);
  console.log('~~~ Wallet ID: ', walletVM.walletModel.id);
  useEffectOnce(() => {
    const stop = queueProcessor(
      walletVM.notifications,
      (notification) => {
        console.log(
          `~~~ Notification: ${notification.id}, ${notification.name} \n${notification.msg}`
        );

        return () => {
          stop();
        };
      },
      500
    );
  });
  return (
    <AppBodyContainer>
      <DisplayNftInfoView />
    </AppBodyContainer>
  );
});

export default DisplayNft;
