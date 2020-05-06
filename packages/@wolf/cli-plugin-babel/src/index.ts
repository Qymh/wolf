import { Plugin, fs } from '@wolf/shared';
import path from 'path';

const index: Plugin = ({ config }) => {
  fs.copyFileSync(
    path.resolve(__dirname, '../src/babel.config.js'),
    path.resolve(config.root, './babel.config.js')
  );
};

export default index;
