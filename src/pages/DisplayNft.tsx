import type { NextPage } from 'next';
import { AppBodyContainer } from '../ui/GlobalStyle.style';
import { DisplayNftView } from '../ui/views/DisplayNftView/DisplayNftView';

const DisplayNft: NextPage = () => {
  return (
    <AppBodyContainer>
      <DisplayNftView />
    </AppBodyContainer>
  );
};

export default DisplayNft;
