const path = require('path');

module.exports = {
  cli: {
    generate: {
      dir: path.resolve(__dirname, 'demo'),
    },
    serve: {
      chainWebpack(config) {
        config.entry('main').add(path.resolve(__dirname, 'demo/main.ts'));
        return config;
      },
    },
  },
  invoke: {
    dir: path.resolve(__dirname, 'demo'),
  },
};
