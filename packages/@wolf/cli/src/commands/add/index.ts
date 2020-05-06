import { Indentifier } from '../index';
import { execa, Plugin } from '@wolf/shared';
import { error } from '../../utils';
import path from 'path';

export const indentifier: Indentifier = {
  command: 'add <plugin-name>',
  description: 'add a new plugin for @wolf',
  options: [],
  async action({ name, chainConfig, config }) {
    function cb(generate?: Plugin) {
      const pkgName = name.replace('@wolf/', '');
      try {
        generate =
          generate ||
          require(path.resolve(
            __dirname,
            'node_modules',
            name,
            `dist/${pkgName}.js`
          ));
        if (!generate) {
          process.exit();
        }
        generate({ chainConfig, config });
      } catch (err) {
        error(err.message);
        process.exit();
      }
    }
    try {
      const generate = require(name);
      cb(generate);
    } catch (err) {
      error(err.message);
      await execa('yarn', ['add', name], {
        stdin: 'inherit',
        cwd: config.root
      }).catch((err) => {
        error(`${name} installed error`);
        process.exit();
      });
      cb();
    }
  }
};
