import type { NextPage } from 'next';
import Head from 'next/head';

import { styled } from '../../stitches.config';
import { Wallet } from '../components/solanawallet/Wallet';
import { makeAutoObservable } from 'mobx';
import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { WalletViewModel } from '../viewmodels/WalletViewModel/WalletViewModel';
import { HomePageView } from '../views/homepage/HomePageView';
import { AppBodyContainer } from '../views/GlobalStyle.style';

const Home: NextPage = () => {
  return (
    <AppBodyContainer>
      <HomePageView />
    </AppBodyContainer>
  );
};

export default Home;
