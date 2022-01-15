import { styled } from '../../stitches.config';

export const AppBodyContainer = styled('div', {
  height: '100vh',
  backgroundColor: 'rgb(20, 20, 20)',
  overflowX: 'hidden',
  overflowY: 'scroll',
  textAlign: 'center',
  fontFamily: '$system',
});

export const Text = styled('p', {
  fontFamily: '$system',
  color: '$loContrast',

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
