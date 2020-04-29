// eslint-disable-next-line no-unused-vars
import { Indentifier } from '../index';
import { baseConfig, chalk, clearConsole } from '@wolf/shared';
// eslint-disable-next-line no-unused-vars
import Config from 'webpack-chain';
import path from 'path';
import webpack from 'webpack';
import WebpackDevServer from 'webpack-dev-server';
import defaultGateway from 'default-gateway';
import address from 'address';
import portfinder from 'portfinder';

export const getDefaultChainWebpack = (
  chainConfig: Config,
  config: typeof baseConfig
) => {
  // entry
  chainConfig.entry('main').add(path.resolve(process.cwd(), 'src/main.js'));

  // resolve
  chainConfig.resolve.alias.set('@', path.resolve(process.cwd(), 'src'));
  chainConfig.resolve.extensions
    .add('.js')
    .add('.jsx')
    .add('.ts')
    .add('.tsx')
    .add('.vue');

  // modules
  chainConfig.resolve.modules
    .add(path.resolve(__dirname, '../', 'node_modules'))
    .add(path.resolve(__dirname, '../../babel-preset-app', 'node_modules'))
    .add(path.resolve(__dirname, '../../shared', 'node_modules'));

  // resolveloader
  chainConfig.resolveLoader.modules
    .add(path.resolve(__dirname, '../', 'node_modules'))
    .add(path.resolve(__dirname, '../../babel-preset-app', 'node_modules'))
    .add(path.resolve(__dirname, '../../shared', 'node_modules'));

  // js ts
  chainConfig.module
    .rule('babel')
    .test(/\.[j|t]sx?$/)
    .use('babel')
    .loader('babel-loader')
    .options({
      ...require('@wolf/babel-preset-app'),
    })
    .end()
    .use('cache-loader')
    .loader('cache-loader')
    .options({
      cacheDirectory: 'node_modules/.cache/babel-loader',
    })
    .end()
    .exclude.add(/node_modules/);

  // vue
  chainConfig.module
    .rule('vue')
    .test(/\.vue$/)
    .use('vue')
    .loader('vue-loader')
    .end()
    .use('cache-loader')
    .loader('cache-loader')
    .options({
      cacheDirectory: 'node_modules/.cache/vue-loader',
    });

  // images
  chainConfig.module
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
  chainConfig.module
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
  chainConfig.module
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
  chainConfig.plugin('vue').use(require('vue-loader').VueLoaderPlugin);

  // NODE_ENV
  chainConfig.plugin('define').use(require('webpack').DefinePlugin, [
    {
      process: {
        env: {
          NODE_ENV: JSON.stringify('development'),
        },
      },
    },
  ]);

  // progress
  chainConfig.plugin('progress').use(
    require('progress-bar-webpack-plugin')({
      format:
        '  build [:bar] ' +
        chalk.green.bold(':percent') +
        ' (:elapsed seconds)',
      clear: false,
      summary: false,
    })
  );

  // invoke
  chainConfig.plugin('invoke').use(require('@wolf/invoke'), [config.invoke]);

  // stats
  chainConfig.stats({
    modules: false,
    children: false,
    chunks: false,
    chunkModules: false,
  });

  // call user config
  config.cli.serve.chainWebpack(chainConfig);
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

function callChainConfig(
  chainConfig: Config,
  config: typeof baseConfig,
  address: string
) {
  getDefaultChainWebpack(chainConfig, config);
  normalizeConfig(chainConfig);
  genDevFunctions(chainConfig, address, config);
  return chainConfig.toConfig();
}

function genDevFunctions(
  chainConfig: Config,
  address: string,
  config: typeof baseConfig
) {
  // devtool
  chainConfig.devtool('cheap-module-eval-source-map');

  // mode
  chainConfig.mode('development');

  // output
  chainConfig.output
    .path(config.cli.serve.output)
    .filename('[name].js')
    .publicPath('/');

  // css
  chainConfig.module
    .rule('css')
    .test(/\.css$/)
    .use('vue-style-loader')
    .loader('vue-style-loader')
    .end()
    .use('css-loader')
    .loader('css-loader');

  // scss
  chainConfig.module
    .rule('scss')
    .test(/\.s[a|c]ss$/)
    .use('vue-style-loader')
    .loader('vue-style-loader')
    .end()
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('sass-loader')
    .loader('sass-loader');

  // devserver
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

  // mini-css
  chainConfig.plugin('css').use(require('mini-css-extract-plugin'), [
    {
      filename: '[name].css',
    },
  ]);

  // friend
  chainConfig.plugin('friend').use(require('friendly-errors-webpack-plugin'));
}

export function normalizeConfig(chainConfig: Config) {
  const mainEntry = chainConfig.entry('main').values();
  const last = mainEntry[mainEntry.length - 1];
  chainConfig.entry('main').clear().add(last);
}

export const indentifier: Indentifier = {
  command: 'serve [entry]',
  description: 'start a development server to run the app',
  options: [],
  async action({ config, chainConfig }) {
    const { host, port, address } = await getAddress(config);
    const webpackConfig = callChainConfig(chainConfig, config, address);
    const compiler = webpack(webpackConfig);
    // console.dir(webpackConfig, { depth: null });
    const serve = new WebpackDevServer(compiler, {
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

    compiler.hooks.done.tap('done', (stats) => {
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
