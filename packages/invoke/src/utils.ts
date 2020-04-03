// import fse from 'fs-extra';
import fs from 'fs';
export type Dictionary<T = any> = {
  [x: string]: T;
};

export function toRawObject(val: any) {
  return Object.prototype.toString.call(val).slice(8, -1);
}

export function isRegExp(val: any) {
  return toRawObject(val) === 'RegExp';
}

export function isVue(str: string) {
  return /\.vue$/i.test(str);
}

export function isJsOrTs(str: string) {
  return /\.[j|t]sx?/.test(str);
}

export function isYAML(str: string) {
  return /\.yml$/i.test(str);
}

export function lowerCase(val: string) {
  return val.toLowerCase();
}

export function isDir(path: string) {
  return fs.statSync(path).isDirectory();
}

export function isFile(path: string) {
  return fs.statSync(path).isFile();
}

export function replacePostfix(path: string) {
  return path.replace(/\.[a-zA-Z]*$/, '');
}

export function camelize(path: string) {
  return path.replace(/(?:[-])(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : c;
  });
}
