import assert from 'assert';
import { chalk } from '@wolf/shared';

export function error(msg?: string) {
  if (msg) {
    assert.fail(chalk.red(`[@wolf/invoke] ${chalk.red(msg)}`));
  }
}
