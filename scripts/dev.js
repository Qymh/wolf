const execa = require('execa');
const args = require('minimist')(process.argv.slice(2));
const path = require('path');
const fs = require('fs-extra');
const chalk = require('chalk');
let target = args._.length ? args._[0] : '';

const packages = fs
  .readdirSync(path.resolve(process.cwd(), 'packages/@wolf'))
  .filter((v) => v !== 'demo');

if (target) {
  for (const value of packages) {
    if (value.match(target)) {
      target = value;
      break;
    }
  }
}

if (target !== '' && !packages.includes(target)) {
  throw new Error(`${chalk.red(`target should be ${packages.join(',')}`)}`);
}

function run(target) {
  execa(
    'rollup',
    ['-wc', 'build/rollup.config.js', '--environment', `TARGET:${target}`],
    {
      stdio: 'inherit'
    }
  );
}

if (target === '') {
  for (const value of packages) {
    run(value);
  }
} else {
  run(target);
}
