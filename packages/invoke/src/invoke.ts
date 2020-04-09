// eslint-disable-next-line no-unused-vars
import { Compiler } from 'webpack';
import { generate } from './generate';
import { ErrorCodes, error } from './error';
import { replacePostfix, camelize } from './utils';

export type Options = {
  dir: string;
  alias: string;

  getRelativePath?: (path: string) => string;
};

export const defaultOptions: Options = {
  dir: '',
  alias: '',
  getRelativePath: (path) => path,
};

export const baseIgnore = /(\.(j|t)s\.DS_Store)$/;

function normalizeOptions(options: Options = defaultOptions) {
  const { dir, alias } = options;
  if (!dir) {
    error(ErrorCodes.NO_DIR);
  }
  if (!alias) {
    error(ErrorCodes.NO_ALIAS);
  }

  options.getRelativePath = generateGetRelativePathFn(dir);

  return options;
}

function generateGetRelativePathFn(dir: Options['dir']) {
  return (path: string) => {
    return camelize(
      replacePostfix(
        path
          .replace(dir, '')
          .replace(/\/(_)?([a-zA-Z0-9])/g, (_, d: string, c: string) => {
            return c ? `/${d || ''}${c.toLowerCase()}` : `${d || ''}${c}`;
          })
      )
    );
  };
}

export class Invoke {
  public $options: Options;
  constructor(options: Options) {
    options = normalizeOptions(options);
    process.env.WOLF_INVOKE_DIR = options.dir;
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
