const { merge } = require('webpack-merge');
const baseConfig = require('./base.config.js');
const path = require('path');

const plugins = [];

module.exports = merge(baseConfig, {
  entry: './launcher.js',
  output: {
    filename: 'launcher.bundle.js',
    path: path.resolve(__dirname, 'public'),
  },

  node: {
    __dirname: false,
    __filename: false,
  },

  plugins,

  target: 'electron-main',
});
