module.exports = {
  env: {
    NODE_ENV: '"development"',
    TARO_APP_API_BASE: '"http://117.72.183.165:3000/api"',
    TARO_APP_MOCK_MODE: '"false"',
  },
  mini: {
    postcss: {
      pxtransform: {
        enable: true,
        config: {},
      },
    },
  },
};
