import { FC } from 'react';
import { observer } from 'mobx-react-lite';

export const MintNftView: FC = observer(() => {
  return (
    <div id={'mintNftView'}>
      <svg
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        width="240"
        height="120"
        xmlSpace="preserve"
        id="canvas1"
      >
        <rect
          id="canvas1-rectangle"
          stroke="none"
          fill="rgb(128, 128, 128)"
          x="13"
          y="15"
          width="89"
          height="39"
          rx="8"
        />
      </svg>
    </div>
  );
});

/*


 */
