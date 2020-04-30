const path = require('path');
const ts = require('rollup-plugin-typescript2');
const rs = require('@rollup/plugin-node-resolve');
const replace = require('@rollup/plugin-replace');
const cjs = require('@rollup/plugin-commonjs');
const fs = require('fs-extra');
const bt = require('builtin-modules');
const execa = require('execa');
const cr = require('chokidar');
const target = process.env.TARGET;

const resolve = (str) =>
  path.resolve(process.cwd(), 'packages/@wolf', target, str);

const pkg = require(`${resolve('package.json')}`);

const dependencies = Object.keys(pkg.dependencies || {});
const devDependencies = Object.keys(pkg.devDependencies || {});

const configs = {
  invoke: {
    input: resolve('src/index.ts'),
    output: {
      file: resolve(`dist/invoke.js`),
      format: 'cjs'
    }
  },
  cli: {
    input: resolve('bin/wolf.ts'),
    output: {
      file: resolve('bin/wolf.js'),
      format: 'cjs'
    }
  },
  shared: {
    input: resolve('src/index.ts'),
    output: {
      file: resolve('dist/shared.js'),
      format: 'cjs'
    }
  },
  'babel-preset-app': {
    input: resolve('src/index.ts'),
    output: {
      file: resolve('dist/babel-preset-app.js'),
      format: 'cjs'
    }
  }
};

const config = configs[target];

const rollupConfig = {
  ...config,
  plugins: [
    cjs(),
    rs({
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }),
    ts({
      check: false
    }),
    replace({
      __DEV__: process.env.NODE_ENV !== 'production'
    })
  ],
  external: Array.from(new Set([...bt, ...dependencies, ...devDependencies]))
};

let watched = false;

if (target === 'invoke') {
  if (!watched) {
    watched = true;
    const watcher = cr.watch(resolve('dist'), { persistent: true });
    watcher.on('all', (event) => {
      if (event === 'change') {
        if (fs.existsSync(resolve('dist/invoke.js'))) {
          execa('node', [resolve('dist/invoke.js')], {
            stdio: 'inherit'
          });
        }
      }
    });
  }
}

module.exports = rollupConfig;
