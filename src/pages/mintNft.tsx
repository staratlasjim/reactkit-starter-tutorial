import type { NextPage } from 'next';
import { AppBodyContainer } from '../ui/GlobalStyle.style';
import { DisplayNftInfoView } from '../ui/views/DisplayNftInfoView/DisplayNftInfoView';
import { MintNftView } from '../ui/views/MintNft/MintNftView';

const MintNft: NextPage = () => {
  return (
    <AppBodyContainer>
      <MintNftView />
    </AppBodyContainer>
  );
};

export default MintNft;
