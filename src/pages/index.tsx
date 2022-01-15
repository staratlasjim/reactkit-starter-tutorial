import type { NextPage } from 'next';
import Head from 'next/head';

import { styled } from '../../stitches.config';

const Text = styled('p', {
  fontFamily: '$system',
  color: '$hiContrast',

  variants: {
    size: {
      1: {
        fontSize: '$1',
      },
      2: {
        fontSize: '$2',
      },
      3: {
        fontSize: '$3',
      },
    },
  },
});

const Home: NextPage = () => {
  return (
    <div>
      <Head>
        <title>NftMe - nft site in a weekend</title>
        <meta name="description" content="NftMe is an nft in a weekend project by StarAtlasJim" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <Text as="h1" size="3">
          Hello, next using Stitches.
        </Text>
      </main>

      <footer></footer>
    </div>
  );
};

export default Home;
