// eslint-disable-next-line no-unused-vars
import { Indentifier } from '../index';
import { getConfig, baseConfig, chalk, clearConsole } from '@wolf/shared';
// eslint-disable-next-line no-unused-vars
import Config from 'webpack-chain';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import defaultGateway from 'default-gateway';
import address from 'address';
import portfinder from 'portfinder';

const getDefaultChainWebpack = (config: Config) => {
  // mode
  config.mode('development');

  // devtool
  config.devtool('cheap-module-eval-source-map');

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
  config.resolve.modules
    .add(path.resolve(__dirname, '../', 'node_modules'))
    .add(path.resolve(__dirname, '../../babel-preset-app', 'node_modules'))
    .add(path.resolve(__dirname, '../../shared', 'node_modules'));

  // resolveloader
  config.resolveLoader.modules
    .add(path.resolve(__dirname, '../', 'node_modules'))
    .add(path.resolve(__dirname, '../../babel-preset-app', 'node_modules'))
    .add(path.resolve(__dirname, '../../shared', 'node_modules'));

  // js ts
  config.module
    .rule('babel')
    .test(/\.[j|t]sx?$/)
    .use('babel')
    .loader('babel-loader')
    .options({
      ...require('@wolf/babel-preset-app'),
    })
    .end()
    .exclude.add(/node_modules/);

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

  // css
  config.plugin('css').use(require('mini-css-extract-plugin'), [
    {
      filename: '[name].css',
    },
  ]);

  // progress
  config.plugin('progress').use(
    require('progress-bar-webpack-plugin')({
      format:
        '  build [:bar] ' +
        chalk.green.bold(':percent') +
        ' (:elapsed seconds)',
      clear: false,
      summary: false,
    })
  );

  // stats
  config.stats({
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  });
};

async function getAddress(config: typeof baseConfig) {
  let { host } = config.cli.serve.devServer;
  if (host.trim() === '0.0.0.0') {
    const res = defaultGateway.v4.sync();
    host = address.ip(res && res.interface) || '0.0.0.0';
  }
  const port = await portfinder.getPortPromise({
    port: config.cli.serve.devServer.port,
  });
  return {
    host,
    port,
    address: `http://${host}:${port}`,
  };
}

function callChainConfig(config: typeof baseConfig, address: string) {
  const chainConfig = new Config();
  getDefaultChainWebpack(chainConfig);
  config.cli.serve.chainWebpack(chainConfig);
  normalizeConfig(chainConfig);
  genDevFunctions(chainConfig, address, config);
  genInvokePlugin(chainConfig, config);
  return chainConfig.toConfig();
}

function genDevFunctions(
  chainConfig: Config,
  address: string,
  config: typeof baseConfig
) {
  chainConfig
    .entry('main')
    .prepend(require.resolve('webpack/hot/dev-server'))
    .prepend(
      require.resolve(`webpack-dev-server/client`) + `?${address}/sockjs-node`
    );

  // html
  chainConfig.plugin('html').use(require('html-webpack-plugin'), [
    {
      template: config.cli.serve.template,
    },
  ]);

  chainConfig.plugin('friend').use(require('friendly-errors-webpack-plugin'));
}

function genInvokePlugin(chainConfig: Config, config: typeof baseConfig) {
  chainConfig.plugin('invoke').use(require('@wolf/invoke'), [config.invoke]);
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
  async action(entry, cmd, args) {
    const config = getConfig();
    const { host, port, address } = await getAddress(config);
    const webpackConfig = callChainConfig(config, address);
    const compilter = webpack(webpackConfig);
    // console.dir(webpackConfig, { depth: null });
    const serve = new WebpackDevServer(compilter, {
      ...(config.cli.serve.devServer as WebpackDevServer.Configuration),
      host,
      noInfo: true,
      historyApiFallback: true,
    });
    serve.listen(port, '0.0.0.0', (err) => {
      if (err) {
        // eslint-disable-next-line no-console
        console.log(err);
      }
    });

    compilter.hooks.done.tap('done', (stats) => {
      if (stats.hasErrors()) {
        return;
      }
      clearConsole();
      // eslint-disable-next-line no-console
      console.log(`
${chalk.green('Build Success')}

Application is running at ${chalk.blue(`http://localhost:${port}`)}
Application is running at ${chalk.blue(`http://${host}:${port}`)}

            `);
    });
  },
};
