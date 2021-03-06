import { Indentifier } from '../index';
import path from 'path';
import resolveFrom from 'resolve-from';
import {
  fs,
  checkDirExisted,
  inquirer,
  execa,
  Dictionary,
  baseConfig
} from '@wolf/shared';
import { error } from '../../utils';

function resolveCwd(address: string, ...args: string[]) {
  return path.resolve(process.cwd(), address, ...args);
}

function genPkg(name: string, plugins: string[]) {
  const clipkg = require('../package.json');
  const version = clipkg.version;
  const dep = {
    vue: clipkg.devDependencies.vue,
    'vue-router': clipkg.devDependencies['vue-router'],
    vuex: clipkg.devDependencies.vuex
  };
  const pkg: any = {
    name,
    version: '0.0.0',
    scripts: {
      serve: 'wolf serve',
      build: 'wolf build'
    },
    dependencies: {
      ...dep
    },
    devDependencies: {
      '@wolf/cli': `^${version}`
    }
  };
  for (const plugin of plugins) {
    if (plugin === 'babel') {
      pkg.devDependencies[`@wolf/babel-preset-app`] = `^${version}`;
    }
    if (plugin === 'eslint') {
      pkg.devDependencies[`@wolf/eslint-config-app`] = `^${version}`;
    }
    pkg.devDependencies[`@wolf/cli-plugin-${plugin}`] = `^${version}`;
  }
  return JSON.stringify(pkg, null, 2);
}

async function choosePlugins() {
  const plugins = await inquirer
    .prompt({
      name: 'plugins',
      type: 'checkbox',
      message: 'please choose plugins',
      choices: ['babel', 'eslint', 'invoke', 'vuex-pro'],
      default: ['babel', 'eslint', 'invoke', 'vuex-pro']
    })
    .then((res) => {
      return res.plugins;
    });
  return plugins;
}

function genTemplate(name: string, args: Dictionary, plugins: string[]) {
  const pkg = genPkg(args.pkgname || name, plugins);
  const dir = resolveCwd(args.target || '', name);
  fs.copySync(path.resolve(__dirname, '../src/commands/create/template'), dir);
  fs.outputFileSync(resolveCwd(args.target || '', name, 'package.json'), pkg);
  return dir;
}

async function download(dir: string) {
  try {
    await execa('lerna', ['bootstrap'], {
      cwd: dir
    });
  } catch (err) {
    error(err);
  }
}

function invokePlugins(
  dir: string,
  plugins: string[],
  config: typeof baseConfig
) {
  plugins.forEach((v) => {
    const plugin = require(resolveFrom(dir, `@wolf/cli-plugin-${v}`));
    const pkg = require(path.resolve(dir, 'package.json'));
    if (typeof plugin === 'function') {
      plugin({ config, pkg, dir });
    }
  });
}

export const indentifier: Indentifier = {
  command: 'create <app-name>',
  description: 'create an app by using plugins of @wolf',
  options: [
    {
      flag: 't',
      details: 'target <target-dir>',
      desc: 'directory relative to process.cwd()'
    },
    {
      flag: 'n',
      details: 'pkgname <[name]>',
      desc: 'packages name'
    }
  ],
  action({ name, args, config, getConfig }) {
    checkDirExisted(resolveCwd(name), async () => {
      const plugins = await choosePlugins();
      const dir = genTemplate(name, args, plugins);
      config = getConfig!(dir);
      await download(dir);
      invokePlugins(dir, plugins, config);
      await download(dir);
    });
  }
};
