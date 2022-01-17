import type { NextPage } from 'next';

import { GetStaticProps } from 'next'

import { HomePageView } from '../ui/views/homepage/HomePageView';
import { AppBodyContainer } from '../ui/GlobalStyle.style';
import {DependencyService} from "../services/injection/DependencyContext";
import {DI_KEYS} from "../core/Constants";


interface HomeProps {
    candyMachineId: string;
    solanaNetwork: string;
    solanaRpcHost: string
}

const Home: NextPage<HomeProps> = ({candyMachineId, solanaNetwork, solanaRpcHost}) => {
    console.log('~~~ Index Props: ', candyMachineId, solanaNetwork, solanaRpcHost);
    DependencyService.registerValue(DI_KEYS.CANDY_MACHINE_ID, candyMachineId);
    DependencyService.registerValue(DI_KEYS.SOLANA_NETWORK, solanaNetwork);
    DependencyService.registerValue(DI_KEYS.SOLANA_RPC_HOST, solanaRpcHost);
  return (
    <AppBodyContainer>
      <HomePageView />
    </AppBodyContainer>
  );
};

export const getStaticProps: GetStaticProps = async (context) => {
    return {
        props: {
            candyMachineId: process.env.REACT_APP_CANDY_MACHINE_ID,
            solanaNetwork: process.env.REACT_APP_SOLANA_NETWORK,
            solanaRpcHost: process.env.REACT_APP_SOLANA_RPC_HOST
        } as HomeProps,
    };
}

export default Home;
