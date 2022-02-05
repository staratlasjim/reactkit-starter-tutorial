import { FC, useState } from 'react';
import { observer } from 'mobx-react-lite';
import { FunkyBtn, Text } from '../../GlobalStyle.style';
import { useViewModel } from '../../../viewmodels/useViewModel';
import { DisplayNftViewModel } from '../../../viewmodels/DisplayNftViewModel/DisplayNftViewModel';
import { isEmpty } from 'lodash';
export const DisplayNftInfoView: FC = observer(() => {
  const vm = useViewModel(DisplayNftViewModel);
  const [address, setAddress] = useState('HkFMrEDgBfbkKXxmUgqBq3zA4hzXp8t8QaxoZBA7oAW9');

  return (
    <div>
      <Text size="3">Display NFT by address</Text>
      <input value={address} onChange={(e) => setAddress(e.target.value)}></input>

      <FunkyBtn
        onClick={() => {
          console.log(`~~~ FunkyBtn click`);
          vm.setMintAddress(address);
        }}
      >
        View Data
      </FunkyBtn>

      {!isEmpty(vm.name) && (
        <div>
          <Text>Name: {vm.name}</Text>
          <Text>Symbol: {vm.symbol}</Text>
          <Text>Fee: {vm.sellerFeeBasisPoints}</Text>
          <Text>URI: {vm.uri}</Text>
          <Text>Description: {vm.description}</Text>
          <Text>Collection:</Text>
          <Text>Name: {vm.collection.name}</Text>
          <Text>Family: {vm.collection.family}</Text>
          <img src={vm.image} style={{ width: '500px', height: '500px' }} />
        </div>
      )}
    </div>
  );
});
