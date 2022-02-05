import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import Head from 'next/head';

import { Text } from '../../GlobalStyle.style';
import {
  AuthedContainer,
  HomeAuthCenterContainer,
  HomePageContainer,
  HomePageGradientText,
  HomePageHeader,
  HomePageHeaderContainer,
  HomePageHeaderSubText,
} from './HomePageView.style';

import { CandyMachineInfoView } from '../../components/candymachine/CandyMachineInfoView';
import { WalletConnectView } from '../../components/walletconnect/WalletConnectView';
import { CandyMachineCountDownTimerView } from '../../components/candy-machine-count-down-timer/CandyMachineCountDownTimerView';
import { DisplayNftImageListView } from '../DisplayNftImageListView/DisplayNftImageListView';

export const HomePageView: FC = observer(() => {
  return (
    <div>
      <Head>
        <title>NftMe - nft site in a weekend</title>
        <meta name="description" content="NftMe is an nft in a weekend project by StarAtlasJim" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <HomePageContainer>
          <HomePageHeaderContainer>
            <Text as="h1" size="3">
              Hello, from NextJs using Stitches, TSyringe and Mobx
            </Text>
            <HomePageHeader>🍭 Candy Drop</HomePageHeader>
            <HomePageHeaderSubText>
              <HomePageGradientText>NFT drop machine with fair mint</HomePageGradientText>
            </HomePageHeaderSubText>
          </HomePageHeaderContainer>
          <HomeAuthCenterContainer>
            <AuthedContainer>
              <WalletConnectView />
            </AuthedContainer>
          </HomeAuthCenterContainer>
          <CandyMachineInfoView />
          <CandyMachineCountDownTimerView />
          <DisplayNftImageListView />
        </HomePageContainer>
      </main>

      <footer></footer>
    </div>
  );
});
