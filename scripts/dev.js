const execa = require('execa');
const assert = require('assert');
const args = require('minimist')(process.argv.slice(2));
const target = args._.length ? args._[0] : '';

if (!target) {
  assert.fail('target is needed');
  return;
}

execa(
  'rollup',
  ['-wc', 'build/rollup.config.js', '--environment', `TARGET:${target}`],
  {
    stdio: 'inherit',
  }
);
