import readline from 'readline';

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

export function deepClone(a: any): any {
  if (Array.isArray(a)) {
    return a.map((v) => deepClone(v));
  } else if (toRawObject(a) === 'Object') {
    const res: any = {};
    for (const key in a) {
      const item = a[key];
      res[key] = toRawObject(item) === 'Object' ? deepClone(item) : item;
    }
    return res;
  } else {
    return a;
  }
}

export function merge(a: any, b: any) {
  const cloneA = deepClone(a);
  for (const key in b) {
    const bitem = b[key];
    const aitem = cloneA[key];
    if (toRawObject(aitem) === 'Object') {
      cloneA[key] = merge(aitem, bitem);
    } else if (aitem) {
      cloneA[key] = bitem || aitem;
    } else {
      cloneA[key] = bitem;
    }
  }
  return cloneA;
}

export function clearConsole() {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows);
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
  }
}
