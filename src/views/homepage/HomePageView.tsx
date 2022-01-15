import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import Head from 'next/head';
import { Wallet } from '../../components/solanawallet/Wallet';
import { Text } from '../GlobalStyle.style';
import {
  AuthedContainer,
  HomeAuthCenterContainer,
  HomePageContainer,
  HomePageGradientText,
  HomePageHeader,
  HomePageHeaderContainer,
  HomePageHeaderSubText,
} from './HomePageView.style';

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
              <Wallet />
            </AuthedContainer>
          </HomeAuthCenterContainer>
        </HomePageContainer>
      </main>

      <footer></footer>
    </div>
  );
});
