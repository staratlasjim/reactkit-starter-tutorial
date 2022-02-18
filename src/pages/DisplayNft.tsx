import type { NextPage } from 'next';
import { AppBodyContainer } from '../ui/GlobalStyle.style';
import { DisplayNftInfoView } from '../ui/views/DisplayNftInfoView/DisplayNftInfoView';

const DisplayNft: NextPage = () => {
  return (
    <AppBodyContainer>
      <DisplayNftInfoView />
    </AppBodyContainer>
  );
};

export default DisplayNft;
