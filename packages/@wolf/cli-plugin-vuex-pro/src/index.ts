import { Plugin, fs } from '@wolf/shared';
import path from 'path';

const index: Plugin = ({ dir, pkg }) => {
  if (pkg && dir) {
    const rawDependencies = require('../package.json').dependencies;
    pkg.dependencies = {
      ...(pkg.dependencies || {}),
      'vuex-pro': rawDependencies['vuex-pro']
    };
    fs.outputFileSync(
      path.resolve(dir, 'package.json'),
      JSON.stringify(pkg, null, 2)
    );
  }
};

export default index;
