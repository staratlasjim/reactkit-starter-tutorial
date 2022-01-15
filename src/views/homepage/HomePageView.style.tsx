import { styled } from '../../../stitches.config';

export const HomePageContainer = styled('div', {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  padding: '0 30px 0 30px',
  color: 'white',
  position: 'relative',
});

export const AuthedContainer = styled('div', {
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  margin: '30px',
});

export const HomePageHeaderContainer = styled('div', {});

export const HomePageHeader = styled('p', {
  margin: '0',
  fontSize: '50px',
  fontWeight: 'bold',
});

export const HomePageHeaderSubText = styled('p', {
  fontSize: '25px',
});

export const HomePageGradientText = styled('span', {
  //backgroundColor: 'red',
  background: '-webkit-linear-gradient(left, #60c657 30%, #35aee2 60%)',
  backgroundClip: 'text',
  color: 'rgba(0, 0, 0, 0)',
  // -webkit-text-fill-color: transparent;
});

export const HomeAuthCenterContainer = styled('div', {
  display: 'flex',
  flexFlow: 'row wrap',
  width: '300px',
  margin: '0px auto',

  '> *': {
    padding: '10px',
    flex: '1 100%',
  },
});
