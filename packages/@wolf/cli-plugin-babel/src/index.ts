import { Plugin, fs, checkDirExisted, Dictionary } from '@wolf/shared';
import path from 'path';

const index: Plugin = ({ chainConfig, config, pkg, dir }) => {
  if (config && !chainConfig) {
    const aim = path.resolve(config.root, './babel.config.js');
    if (fs.existsSync(aim)) {
      checkDirExisted(aim, () => {
        fs.copyFileSync(path.resolve(__dirname, '../src/babel.config.js'), aim);
      });
    } else {
      fs.outputFileSync(aim, '');
      fs.copyFileSync(path.resolve(__dirname, '../src/babel.config.js'), aim);
    }
  }
  if (pkg) {
    const rawDependencies = require('@wolf/babel-preset-app/package.json')
      .dependencies;
    pkg.dependencies = {
      ...(pkg.dependencies || {}),
      '@babel/polyfill': rawDependencies['@babel/polyfill'],
      'core-js': rawDependencies['core-js']
    };
    fs.outputFileSync(
      path.resolve(dir!, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );
  }
};

export default index;
