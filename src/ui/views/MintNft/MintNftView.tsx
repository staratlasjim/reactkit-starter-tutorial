import { FC, useEffect } from 'react';
import { observer } from 'mobx-react-lite';
import { MintNftButton } from '../../components/mintNft/MintNftButton';
import { useHandleEvent } from '../../hooks/useHandleEvent';
import { useViewModel } from '../../../viewmodels/useViewModel';
import { MintNftViewModel } from '../../../viewmodels/mintnft/MintNftViewModel';
import { useIsomorphicLayoutEffect, useWindowSize } from 'react-use';
import anime from 'animejs';
import { toString, toNumber, isNumber } from 'lodash';

export const MintNftView: FC = observer(() => {
  const vm = useViewModel(MintNftViewModel);
  const { width, height } = useWindowSize();
  useHandleEvent('mint-button:onclick', (event: CustomEvent) => {
    console.log(`~~~ Got Event for ${event.detail.id}`);
    //vm.onMintButtonClick(event);
    vm.transferNFT();
  });

  useEffect(() => {
    console.log(`~~~~ windowSize: ${width} / ${height}`);
    const mintNftStatusMsgs = document.getElementById('mintNftStatusMsgs');
    const eleWidthVal = anime.get(mintNftStatusMsgs, 'width');
    const eleWidth = isNumber(eleWidthVal)
      ? eleWidthVal
      : toNumber(toString(eleWidthVal).replace(/px/g, ''));
    anime({
      targets: mintNftStatusMsgs,
      translateX: -(toNumber(eleWidth) + 10),
      translateY: 10,
      opacity: 1,
      begin: function (anim) {
        console.log('began : ' + anim.began);
      },
      complete: function (anim) {
        console.log('completed : ' + anim.completed);
      },
    });
  }, [width, height, vm.statusMessages]);

  return (
    <>
      <div>
        <MintNftButton id={'1'} />
      </div>
      <div style={{ color: 'white' }}>
        {vm.hasStarted && <p>Has Started Minting</p>}
        {vm.hasFinished && <p>Has Finished</p>}
      </div>
      <div
        id={'mintNftStatusMsgs'}
        style={{
          position: 'absolute',
          color: 'red',
          zIndex: 1,
          top: '0px',
          left: '100%',
          opacity: 0,
          maxWidth: '300px',
        }}
      >
        {vm.statusMessages.length > 0 &&
          vm.statusMessages.map((value) => {
            return <div key={value.key}>{value.msg}</div>;
          })}
      </div>
    </>
  );
});

/*


 */
