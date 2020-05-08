const path = require('path');
const resolve = (add) => path.resolve(__dirname, add);

module.exports = {
  root: __dirname,
  cli: {
    generate: {
      root: resolve('src/views')
    },
    serve: {
      entry: resolve('src/main.ts'),
      chainWebpack(config) {
        config.resolve.alias.set('@', resolve('src/views'));
        return config;
      }
    }
  },
  invoke: {
    root: resolve('src/views'),
    outputDir: resolve('.wolf')
  }
};
