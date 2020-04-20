import joi from '@hapi/joi';

export function camelize(path: string) {
  return path.replace(/(?:[-])(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : c;
  });
}

export function lowerCase(val: string) {
  return val.toLowerCase();
}

export type Dictionary<T = any> = {
  [x: string]: T;
};

export function createSchema(fn: (_joi: typeof joi) => joi.ObjectSchema) {
  return fn(joi);
}

export function tuple<T extends string[]>(...args: T) {
  return args;
}
