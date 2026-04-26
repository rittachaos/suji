const path = require('path');

const config = {
  projectName: 'suji-miniapp',
  date: '2026-04-22',
  designWidth: 375,
  deviceRatio: {
    375: 2,
    640: 2.34 / 2,
    750: 1,
    828: 1.81 / 2,
  },
  sourceRoot: 'src',
  outputRoot: 'dist',
  plugins: [],
  defineConstants: {},
  alias: {
    '@': path.resolve(__dirname, '..', 'src'),
  },
  copy: {
    patterns: [],
    options: {},
  },
  framework: 'react',
  compiler: {
    type: 'webpack5',
    prebundle: {
      enable: false,
    },
  },
  mini: {},
  h5: {},
};

module.exports = function (merge) {
  const envConfig = process.env.NODE_ENV === 'development' ? require('./dev') : require('./prod');
  return merge({}, config, envConfig);
};
