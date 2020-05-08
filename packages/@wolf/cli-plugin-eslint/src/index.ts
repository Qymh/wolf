import { Plugin, fs, checkDirExisted, Dictionary } from '@wolf/shared';
import path from 'path';

const index: Plugin = ({ chainConfig, config, pkg, dir }) => {
  if (config && !chainConfig) {
    const aim = path.resolve(config.root, './.eslintrc.js');
    if (fs.existsSync(aim)) {
      checkDirExisted(aim, () => {
        fs.copyFileSync(path.resolve(__dirname, '../src/.eslintrc.js'), aim);
      });
    } else {
      fs.outputFileSync(aim, '');
      fs.copyFileSync(path.resolve(__dirname, '../src/.eslintrc.js'), aim);
    }
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
