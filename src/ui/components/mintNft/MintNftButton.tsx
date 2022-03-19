import { FC, useCallback, useEffect, useRef, useState } from 'react';
import anime from 'animejs';
import { useHoverDirty, useIsomorphicLayoutEffect } from 'react-use';
import { EventService } from '../../../services/events/EventService';

export const MintNftButton: FC<{ id: string | number }> = (props) => {
  const { id } = props;
  const svgRef = useRef(null);
  const isHovering = useHoverDirty(svgRef);

  const onClickHandler = useCallback(() => {
    console.log('~~~ CLICK ~~~~~');
    anime({
      targets: '#mintNftButton-background',
      fill: 'rgb(255, 255, 255)',
      loop: 1,
      direction: 'reverse',
      duration: 250,
    });
    EventService.trigger('mint-button:onclick', { id });
  }, []);

  useEffect(() => {
    console.log(`~~~ hover ~~~~~ ${isHovering ? 'hovering' : 'not hovering'}`);
    const color = isHovering ? 'rgb(255, 0, 0)' : 'rgb(255, 255, 255)';
    console.log(`${color}`);
    anime({
      targets: '#mintNftButton-text',
      fill: color,
      easing: 'linear',
      duration: 250,
    });
  }, [isHovering]);

  return (
    <svg
      version="1.1"
      xmlns="http://www.w3.org/2000/svg"
      width="300"
      height="300"
      id="mintNftButton"
    >
      <rect
        ref={svgRef}
        id="mintNftButton-background"
        stroke="none"
        fill="rgb(128, 128, 128)"
        x="3"
        y="3"
        width="194"
        height="71"
        rx="8"
        onClick={onClickHandler}
        style={{ cursor: 'pointer' }}
      />
      <text
        id={'mintNftButton-text'}
        fill="rgb(255, 255, 255)"
        fontFamily="HelveticaNeue, 'Helvetica Neue', Helvetica, Arial, sans-serif"
        fontSize="25"
        x="48.6"
        y="3"
        textAnchor="middle"
        pointerEvents={'none'}
      >
        <tspan x="100" y="47">
          Mint NFT
        </tspan>
      </text>
    </svg>
  );
};
