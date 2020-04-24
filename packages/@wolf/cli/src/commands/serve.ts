// eslint-disable-next-line no-unused-vars
import { Indentifier } from './index';
import { getConfig, baseConfig } from '@wolf/shared';
// eslint-disable-next-line no-unused-vars
import Config from 'webpack-chain';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';

const getDefaultChainWebpack = (config: Config) => {
  // mode
  config.mode('development');

  // entry
  config.entry('main').add(path.resolve(process.cwd(), 'src/main.js'));

  // output
  config.output
    .path(path.resolve(process.cwd(), 'dist'))
    .filename('[name].js')
    .publicPath('/');

  // resolve
  config.resolve.alias.set('@', path.resolve(process.cwd(), 'src'));
  config.resolve.extensions
    .add('.js')
    .add('.jsx')
    .add('.ts')
    .add('.tsx')
    .add('.vue');
  config.resolve.modules.add(path.resolve(process.cwd(), 'node_modules'));

  // js ts
  config.module
    .rule('babel')
    .test(/\.[j|t]sx?$/)
    .use('babe')
    .loader('babel-loader')
    .options({
      exclude: /node_modules/,
      ...require('@wolf/babel-preset-app'),
    });

  // vue
  config.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue')
    .loader('vue-loader');

  // css
  config.module
    .rule('css')
    .test(/\.css$/)
    .use('css')
    .loader('vue-style-loader')
    .loader('css-loader');

  // scss
  config.module
    .rule('scss')
    .test(/\.s[a|c]ss$/)
    .use('scss')
    .loader('sass-loader')
    .loader('vue-style-loader')
    .loader('css-loader');

  // images
  config.module
    .rule('images')
    .test(/\.(png|jpe?g|gif|webp)$/i)
    .use('images')
    .loader('url-loader')
    .options({
      limit: 4096,
      fallback: {
        loader: 'file-loader',
        options: {
          name: 'images/[name].[hash:8].[ext]',
        },
      },
    });

  // media
  config.module
    .rule('media')
    .test(/\.(png|jpe?g|gif|webp)$/i)
    .use('media')
    .loader('url-loader')
    .options({
      limit: 4096,
      fallback: {
        loader: 'file-loader',
        options: {
          name: 'media/[name].[hash:8].[ext]',
        },
      },
    });

  // fonts
  config.module
    .rule('fonts')
    .test(/\.(woff2?|eot|ttf|otf)$/i)
    .use('fonts')
    .loader('url-loader')
    .options({
      limit: 4096,
      fallback: {
        loader: 'file-loader',
        options: {
          name: 'fonts/[name].[hash:8].[ext]',
        },
      },
    });

  // vue plugins
  config.plugin('vue').use(require('vue-loader').VueLoaderPlugin);

  // NODE_ENV
  config.plugin('define').use(require('webpack').DefinePlugin, [
    {
      process: {
        env: {
          NODE_ENV: JSON.stringify('development'),
        },
      },
    },
  ]);

  // html
  config.plugin('html').use(require('html-webpack-plugin'), [
    {
      template: path.resolve(process.cwd(), 'public/index.html'),
    },
  ]);

  // css
  config.plugin('css').use(require('mini-css-extract-plugin'), [
    {
      filename: '[name].css',
    },
  ]);
};

function callChainConfig(config: typeof baseConfig) {
  const chainConfig = new Config();
  getDefaultChainWebpack(chainConfig);
  config.cli.serve.chainWebpack(chainConfig);
  normalizeConfig(chainConfig);
  genDevClients(chainConfig);
  return chainConfig.toConfig();
}

function genDevClients(chainConfig: Config) {
  chainConfig
    .entry('main')
    .prepend(require.resolve('webpack/hot/dev-server'))
    .prepend(
      require.resolve(`webpack-dev-server/client`) +
        '?http://172.20.49.66:8080/sockjs-node'
    );
}

function normalizeConfig(chainConfig: Config) {
  const mainEntry = chainConfig.entry('main').values();
  const last = mainEntry[mainEntry.length - 1];
  chainConfig.entry('main').clear().add(last);
}

export const indentifier: Indentifier = {
  command: 'serve [entry]',
  description: 'start a development server to run the app',
  options: [],
  action(entry, cmd, args) {
    const config = getConfig();
    const webpackConfig = callChainConfig(config);
    const compilter = webpack(webpackConfig);
    const serve = new WebpackDevServer(compilter, {
      hot: true,
    });
    serve.listen(8080, '0.0.0.0', (err) => {
      console.log(err);
    });
  },
};
