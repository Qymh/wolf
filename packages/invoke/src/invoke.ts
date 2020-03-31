// eslint-disable-next-line no-unused-vars
import { Compiler } from 'webpack';
import { generate } from './generate';
import { ErrorCodes, error } from './error';
import { isYAML, isVue, replacePostfix } from './utils';

export type Options = {
  dir: string;
  yml?: string | RegExp;

  isValidFileOrDir?: (path: string) => boolean;
  getRelativePath?: (path: string) => string;
};

export const defaultOptions: Options = {
  dir: '',
  yml: 'meta.yml',
  isValidFileOrDir: (path) => !!path,
  getRelativePath: (path) => path,
};

export const baseIgnore = /(\.(j|t)s\.DS_Store)$/;

function normalizeOptions(options: Options = defaultOptions) {
  const { dir, yml } = options;
  if (!dir) {
    error(ErrorCodes.NO_DIR);
  }
  if (yml) {
    if (typeof yml === 'string' && !isYAML(yml)) {
      error(ErrorCodes.WRONG_YML, '', yml);
    }
  }

  options.isValidFileOrDir = generateisValidFileOrDirFn();
  options.getRelativePath = generateGetRelativePathFn(dir);

  return options;
}

function generateGetRelativePathFn(dir: Options['dir']) {
  return (path: string) => {
    return replacePostfix(
      path.replace(dir, '').replace(/\/(\w)/g, (_, c: string) => {
        return c ? `/${c.toLowerCase()}` : `/${c}`;
      })
    );
  };
}

function generateisValidFileOrDirFn() {
  return (path: string) => {
    path = path.toLowerCase();
    return (
      isVue(path) ||
      isYAML(path) ||
      path.includes('index.js') ||
      path.includes('index.jsx') ||
      path.includes('index.ts') ||
      path.includes('index.tsx')
    );
  };
}

export class Invoke {
  public $options: Options;
  constructor(options: Options) {
    options = normalizeOptions(options);
    this.$options = options;
  }

  apply(compiler: Compiler) {
    // webpack4
    if (compiler.hooks && compiler.hooks.entryOption) {
      compiler.hooks.entryOption.tap('invoke', () => {
        generate(this.$options);
      });
    }
    // webpack3
    else {
      compiler.plugin('entry-option', () => {
        generate(this.$options);
      });
    }
  }

  test() {
    generate(this.$options);
  }
}
