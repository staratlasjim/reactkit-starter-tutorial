import { observer } from 'mobx-react-lite';
import { FC } from 'react';
import { Text } from '../../GlobalStyle.style';
import { useViewModel } from '../../../viewmodels/useViewModel';
import { DisplayNftImageListViewModel } from '../../../viewmodels/DisplayNftImageListViewModel';
import { nanoid } from 'nanoid';

export const DisplayNftImageListView: FC = observer(() => {
  const vm = useViewModel(DisplayNftImageListViewModel);
  return (
    <div>
      <Text>Nft Image List: </Text>
      {vm.imagesSrc.length > 0 && (
        <ul>
          {vm.imagesSrc.map((value) => {
            return (
              <li key={nanoid()}>
                <img src={value} style={{ width: '300px', height: '300px' }} />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
});
