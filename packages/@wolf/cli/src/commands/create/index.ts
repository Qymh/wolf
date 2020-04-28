// eslint-disable-next-line no-unused-vars
import { Indentifier } from '../index';
import path from 'path';
import { fs } from '@wolf/shared';
import { checkDirExisted } from '../../utils';

function resolveCwd(address: string, ...args: string[]) {
  return path.resolve(process.cwd(), address, ...args);
}

function genPkg(name: string) {
  const version = require('../package.json').version;
  const pkg = {
    name,
    version: '0.0.0',
    scripts: {
      serve: 'wolf serve',
    },
    dependencies: {
      vue: '3.0.0-alpha.13',
      'vue-router': '4.0.0-alpha.5',
    },
    devDependencies: {
      '@wolf/cli': `^${version}`,
    },
  };
  return JSON.stringify(pkg);
}

function genTemplate(name: string) {
  const pkg = genPkg(name);
  const dir = resolveCwd(name);
  fs.copySync(path.resolve(__dirname, '../src/commands/create/template'), dir);
  fs.outputFileSync(resolveCwd(name, 'package.json'), pkg);
}

export const indentifier: Indentifier = {
  command: 'create <app-name>',
  description: 'create an app by using plugins of @wolf',
  options: [],
  action(name, cmd, args) {
    checkDirExisted(resolveCwd(name), () => genTemplate(name));
  },
};
