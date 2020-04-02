import chalk from 'chalk';
import assert from 'assert';

export function error(
  code: ErrorCodes,
  before?: string,
  raw?: any,
  details?: string
) {
  // eslint-disable-next-line no-console
  assert.fail(
    chalk.red(
      `[@wolf/invoke] ${before || ''} ${errorMessages[code]} ${
        raw ? `, which get ${chalk.blueBright(raw)}` : ''
      } ${details ? `, ${details}` : ''}`
    )
  );
}

export function warn(
  code: ErrorCodes,
  before?: string,
  raw?: any,
  details?: string
) {
  // eslint-disable-next-line no-console
  console.log(
    chalk.yellow(
      `[@wolf/invoke] ${before || ''} ${errorMessages[code]}${
        raw ? `, which get ${chalk.blueBright(raw)}` : ''
      } ${details ? `, ${details}` : ''}`
    )
  );
}

/* eslint-disable no-unused-vars */
export const enum ErrorCodes {
  // public errors
  NOT_A_DIR,
  NO_ALIAS,
  NOT_HAS_HOME,
  MULTIPLE_PAGE,
  WRONG_DIR_NAME,

  // options errors
  NO_DIR,
  WRONG_YML,
}
/* eslint-enable no-unused-vars */

export const errorMessages = {
  // public errors
  [ErrorCodes.NOT_A_DIR]: 'must be a directory',
  [ErrorCodes.NOT_HAS_HOME]:
    'must set a page which called Index.vue,Index.js,Index.ts,Index.jsx,Index.tsx',
  [ErrorCodes.MULTIPLE_PAGE]: 'there can only have one default page',
  [ErrorCodes.WRONG_DIR_NAME]:
    ', you can not name a directory which called index',

  // options errors
  [ErrorCodes.NO_DIR]: 'the dir option is needed',
  [ErrorCodes.NO_ALIAS]: 'the alias option is needed',
  [ErrorCodes.WRONG_YML]: 'the yml option is not a valid yml name',
};
