import assert from 'assert';
import { chalk, fs, inquirer } from '@wolf/shared';

export function error(msg?: string) {
  if (msg) {
    assert.fail(chalk.red(`\n\n[@wolf/cli] ${chalk.red(msg)}\n\n`));
  }
}

export async function checkDirExisted(dir: string, cb: Function) {
  if (fs.existsSync(dir)) {
    await inquirer
      .prompt({
        name: 'overrideDir',
        type: 'confirm',
        message: `${chalk.blue(dir)} is existed, are you sure to override it?`
      })
      .then(async (res) => {
        if (!res.overrideDir) {
          process.exit();
        } else {
          fs.removeSync(dir);
          cb();
        }
      });
  } else {
    cb();
  }
}
