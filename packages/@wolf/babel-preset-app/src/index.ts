module.exports = {
  presets: [require('@babel/preset-typescript')],
  plugins: [
    require('babel-plugin-transform-vue-jsx'),
    require('@babel/plugin-syntax-dynamic-import')
  ]
};
