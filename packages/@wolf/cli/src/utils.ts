import program from 'commander';
import assert from 'assert';
import chalk from 'chalk';

export { program };

export function error(msg?: string) {
  if (msg) {
    assert.fail(chalk.red(`[@wolf/invoke] ${chalk.red(msg)}`));
  }
}
