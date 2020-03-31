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

  // options errors
  NO_DIR,
  WRONG_YML,
}
/* eslint-enable no-unused-vars */

export const errorMessages = {
  // public errors
  [ErrorCodes.NOT_A_DIR]: 'must be a directory',

  // options errors
  [ErrorCodes.NO_DIR]: 'the dir option is needed',
  [ErrorCodes.WRONG_YML]: 'the yml option is not a valid yml name',
};
