export const isSSR = (): boolean => {
  return typeof window === 'undefined';
};

export const isCSR = (): boolean => {
  return !isSSR();
};
