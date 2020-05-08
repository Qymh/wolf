module.exports = (api: any) => ({
  presets: [
    require('@babel/preset-typescript'),
    require('@babel/preset-env').default(api, {
      useBuiltIns: 'usage',
      corejs: '3.0.0'
    })
  ],
  plugins: [
    require('babel-plugin-transform-vue-jsx'),
    require('@babel/plugin-syntax-dynamic-import')
  ]
});
