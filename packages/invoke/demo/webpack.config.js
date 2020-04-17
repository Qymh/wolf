const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { VueLoaderPlugin } = require('vue-loader');
const isDev = process.env.NODE_ENV === 'development';
const resolve = (str) =>
  path.resolve(process.cwd(), 'packages/invoke/demo', str);
const Invoke = require('../dist/invoke.dev');

const base = {
  mode: process.env.NODE_ENV,
  entry: resolve('main.ts'),
  output: {
    path: resolve('dist'),
    filename: 'bundle.js',
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
      },
      {
        test: /\.vue$/,
        loader: 'vue-loader',
      },
      {
        test: /\.scss$/,
        loader: ['vue-style-loader', 'css-loader', 'sass-loader'],
      },
    ],
  },
  plugins: [
    new VueLoaderPlugin(),
    new HtmlWebpackPlugin({
      template: resolve('index.html'),
    }),
    new Invoke({
      dir: resolve('views'),
      alias: resolve('views'),
    }),
  ],
  resolve: {
    alias: {
      '@': resolve('views'),
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
};

if (isDev) {
  base.devServer = {
    host: '0.0.0.0',
    port: '7777',
    inline: true,
    clientLogLevel: 'warning',
    historyApiFallback: true,
    watchOptions: {
      ignored: /node_modules/,
    },
  };
} else {
  base.optimization = {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        vendors: {
          test: /[\\/]node_modules[\\/]/,
          priority: 10,
          chunks: 'initial',
        },
        async: {
          priority: 5,
          chunks: 'async',
        },
      },
    },
    runtimeChunk: {
      name: 'runtime',
    },
  };
}

module.exports = base;
