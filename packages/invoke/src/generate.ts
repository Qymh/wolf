// eslint-disable-next-line no-unused-vars
import { Options } from './invoke';
import { genAST } from './ast';

export function generate(options: Options) {
  genAST(options.dir, options);
}
