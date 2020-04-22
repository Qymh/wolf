export type Dictionary<T = any> = {
  [x: string]: T;
};

export function camelize(path: string) {
  return path.replace(/(?:[-])(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : c;
  });
}

export function lowerCase(val: string) {
  return val.toLowerCase();
}

export function tuple<T extends string[]>(...args: T) {
  return args;
}

export function toRawObject(val: any) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

export function merge(a: any, b: any) {
  const cloneA = JSON.parse(JSON.stringify(a));
  for (const key in b) {
    const bitem = b[key];
    const aitem = cloneA[key];
    if (toRawObject(aitem) === 'Object') {
      b[key] = merge(aitem, bitem);
    } else if (aitem) {
      b[key] = aitem;
    }
  }
  return cloneA;
}
