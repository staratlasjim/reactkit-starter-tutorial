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

export const FunkyBtn = styled('button', {
  background: '-webkit-linear-gradient(left, #60c657 30%, #35aee2 60%)',
  color: 'white',
  fontSize: '25px',
  borderRadius: '8px',
  minHeight: '50px',
  maxHeight: '150px',
  minWidth: '350px',
  maxWidth: '450px',
});
