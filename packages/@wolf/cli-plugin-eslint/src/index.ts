import {
  Plugin,
  fs,
  checkDirExisted,
  Dictionary,
  baseConfig
} from '@wolf/shared';
import path from 'path';

function move(target: string, local: string, root: string) {
  const aim = path.resolve(root, target);
  if (fs.existsSync(aim)) {
    checkDirExisted(aim, () => {
      fs.copyFileSync(path.resolve(__dirname, local), aim);
    });
  } else {
    fs.outputFileSync(aim, '');
    fs.copyFileSync(path.resolve(__dirname, local), aim);
  }
}

const index: Plugin = ({ chainConfig, config, pkg, dir }) => {
  if (config && !chainConfig) {
    move('./.eslintrc.js', '../src/.eslintrc.js', config.root);
    move('./.eslintignore', '../src/.eslintignore', config.root);
  }
  if (pkg) {
    const rawDependencies = require('@wolf/eslint-config-app/package.json')
      .dependencies;
    const eslintDependencies = Object.keys(rawDependencies).reduce<Dictionary>(
      (acc, val) => {
        if (/eslint/.test(val)) {
          acc[val] = rawDependencies[val];
        }
        return acc;
      },
      {}
    );
    pkg.devDependencies = {
      ...pkg.devDependencies,
      ...eslintDependencies
    };
    fs.outputFileSync(
      path.resolve(dir!, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );
  }
};

export default index;
