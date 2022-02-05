import type { NextPage } from 'next';

import { GetStaticProps } from 'next';

import { HomePageView } from '../ui/views/homepage/HomePageView';
import { AppBodyContainer } from '../ui/GlobalStyle.style';

const Home: NextPage = () => {
  return (
    <AppBodyContainer>
      <HomePageView />
    </AppBodyContainer>
  );
};

export default Home;
