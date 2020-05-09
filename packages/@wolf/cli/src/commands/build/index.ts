import { Indentifier } from '../index';
import Config from 'webpack-chain';
import { baseConfig, chalk, fs } from '@wolf/shared';
import { getDefaultChainWebpack, normalizeConfig } from '../serve';
import Css from 'mini-css-extract-plugin';
import webpack from 'webpack';

function callChainConfig(chainConfig: Config, config: typeof baseConfig) {
  getDefaultChainWebpack(chainConfig, config);
  normalizeConfig(chainConfig);
  genProdFunctions(chainConfig, config);
  return chainConfig.toConfig();
}

function genProdFunctions(chainConfig: Config, config: typeof baseConfig) {
  // devtool
  chainConfig.devtool('#cheap-module-source-map');

  // mode
  chainConfig.mode('production');

  // output
  chainConfig.output
    .path(config.cli.serve.output)
    .filename('[name].[chunkhash].js')
    .publicPath('/');

  // css
  chainConfig.module
    .rule('css')
    .test(/\.css$/)
    .use('mini-css')
    .loader(Css.loader)
    .end()
    .use('css-loader')
    .loader('css-loader');

  // scss
  chainConfig.module
    .rule('scss')
    .test(/\.s[a|c]ss$/)
    .use('mini-css')
    .loader(Css.loader)
    .end()
    .use('css-loader')
    .loader('css-loader')
    .end()
    .use('sass-loader')
    .loader('sass-loader');

  // split chunks
  chainConfig.optimization
    .splitChunks({
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial'
        },
        async: {
          priority: 5,
          chunks: 'async'
        }
      }
    })
    .runtimeChunk('single');

  // css
  chainConfig.plugin('css').use(require('mini-css-extract-plugin'), [
    {
      filename: '[name].[hash].css'
    }
  ]);
}

function outputAssets(json: webpack.Stats.ToJsonOutput) {
  const { assets } = json;
  if (assets) {
    for (const value of assets) {
      console.log(
        `module: ${chalk.blue(value.name)}
size:   ${chalk.green((value.size / 1024).toFixed(2))}kb\n`
      );
    }
  }
}

export const indentifier: Indentifier = {
  command: 'build',
  description: 'build an app for production',
  options: [],
  action({ name, config, chainConfig }) {
    const webpackConfig = callChainConfig(chainConfig, config);
    // console.dir(webpackConfig, { depth: null });
    try {
      fs.removeSync(config.cli.serve.output);
    } catch (error) {}
    webpack(webpackConfig, (err, stats) => {
      if (err) {
        throw new Error(err.message);
      }
      const { errors, warnings } = stats.toJson('errors-only');
      if (stats.hasErrors()) {
        console.log(chalk.red(errors.join('\n')));
      }
      if (stats.hasWarnings()) {
        console.log(chalk.yellow(warnings.join('\n')));
      }

      const json = stats.toJson({ hash: false, modules: false, chunks: false });
      outputAssets(json);

      console.log(chalk.green('\n build successed \n'));
      process.exit();
    });
  }
};
