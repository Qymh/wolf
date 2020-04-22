import fs from 'fs-extra';
import path from 'path';
import { merge } from './base';

export const baseConfig = {
  cli: {
    generate: {
      type: 'single',
      language: 'ts',
      preprocessor: 'scss',
    },
  },
};

export function getConfig(): typeof baseConfig {
  const context = process.cwd();
  const configNames = ['wolf.config.js', 'wolf.config.ts'];
  for (const name of configNames) {
    const file = path.resolve(context, name);
    if (fs.existsSync(file)) {
      const userConfig = require(file);
      return merge(baseConfig, userConfig);
    }
  }
  return baseConfig;
}
