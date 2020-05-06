module.exports = {
  root: true,
  parser: 'vue-eslint-parser',
  plugins: ['@typescript-eslint'],
  extends: ['standard', 'plugin:vue/vue3-recommended'],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  rules: {
    semi: ['error', 'always'],
    'vue/component-tags-order': [
      'error',
      {
        order: ['template', 'script', 'style']
      }
    ]
  }
};
