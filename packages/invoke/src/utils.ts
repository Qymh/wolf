// import fse from 'fs-extra';
import _fs from 'fs';
import readline from 'readline';
import { success } from './error';
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
  return /route\.yml$/i.test(str);
}

export function lowerCase(val: string) {
  return val.toLowerCase();
}

export function isDir(path: string) {
  return _fs.statSync(path).isDirectory();
}

export function isFile(path: string) {
  return _fs.statSync(path).isFile();
}

export function replacePostfix(path: string) {
  return path.replace(/\.[a-zA-Z]*$/, '');
}

export function camelize(path: string) {
  return path.replace(/(?:[-])(\w)/g, (_, c: string) => {
    return c ? c.toUpperCase() : c;
  });
}

export function clearConsole(path?: string) {
  if (process.stdout.isTTY) {
    const blank = '\n'.repeat(process.stdout.rows);
    // eslint-disable-next-line no-console
    console.log(blank);
    readline.cursorTo(process.stdout, 0, 0);
    readline.clearScreenDown(process.stdout);
    if (path) {
      success(path);
    }
  }
}
