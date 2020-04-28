// eslint-disable-next-line no-unused-vars
import { Compiler } from 'webpack';
import path from 'path';
// eslint-disable-next-line no-unused-vars
import { NavigationGuard, RouterOptions } from 'vue-router';
import { generate } from './generate';
import { ErrorCodes, error } from './error';
import { replacePostfix, isDir } from './utils';
import { camelize } from '@wolf/shared';

export type Options = {
  root: string;
  alias: string;
  dist?: string;
  outputDir: string;
  language?: 'javascript' | 'typescript';
  mode?: 'history' | 'hash';

  getRelativePath?: (path: string) => string;

  // raw vue-router options

  beforeEach?: NavigationGuard;
  afterEach?: NavigationGuard;
  scrollBehavior?: RouterOptions['scrollBehavior'];
};

export const defaultOptions: Options = {
  root: '',
  alias: '',
  dist: '',
  outputDir: '',
  language: 'javascript',
  mode: 'history',
  getRelativePath: (path) => path,
};

function normalizeOptions(options: Options): Options | never {
  options = { ...defaultOptions, ...options };
  const { root, language, outputDir } = options;
  if (!root) {
    error(ErrorCodes.NO_ROOT);
    process.exit(1);
  }
  try {
    if (outputDir && !isDir(outputDir)) {
      process.exit(1);
    }
  } catch (e) {
    error(ErrorCodes.WRONG_OUTPUTDIR);
  }
  options.alias = root;

  options.getRelativePath = generateGetRelativePathFn(root);
  options.dist =
    (outputDir || root) +
    `/.invoke/router.${language === 'javascript' ? 'js' : 'ts'}`;

  return options;
}

function generateGetRelativePathFn(dir: Options['root']) {
  return (address: string) => {
    return camelize(
      replacePostfix(
        '/' +
          path
            .relative(dir, address)
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
    process.env.WOLF_INVOKE_DIR = options.root;
    this.$options = options;
  }

  apply(compiler: Compiler) {
    // webpack4
    if (compiler.hooks?.entryOption) {
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
