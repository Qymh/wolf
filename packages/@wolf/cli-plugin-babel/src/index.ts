import { Plugin, fs, checkDirExisted } from '@wolf/shared';
import path from 'path';

const index: Plugin = ({ chainConfig, config }) => {
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
};

export default index;
