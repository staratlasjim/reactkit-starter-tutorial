const presets = ['next/babel'];

const plugins = [
  'babel-plugin-transform-typescript-metadata',
  ['@babel/plugin-proposal-decorators', { legacy: true }],
];

// Production-only plugins

module.exports = {
  presets,
  plugins,
};
