import joi from '@hapi/joi';

export function createSchema(fn: (_joi: typeof joi) => joi.ObjectSchema) {
  return fn(joi);
}
