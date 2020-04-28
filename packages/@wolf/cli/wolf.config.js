const path = require('path');

module.exports = {
  cli: {
    generate: {
      root: path.resolve(__dirname, 'demo/views'),
    },
    serve: {
      template: path.resolve(__dirname, 'demo/public/index.html'),
      chainWebpack(config) {
        config.entry('main').add(path.resolve(__dirname, 'demo/main.ts'));
        config.resolve.alias.set(
          '@',
          path.resolve(process.cwd(), 'demo/views')
        );
        return config;
      },
    },
  },
  invoke: {
    root: path.resolve(__dirname, 'demo/views'),
    outputDir: path.resolve(__dirname, 'demo'),
    mode: 'history',
  },
};
