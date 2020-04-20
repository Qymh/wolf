import { indentifier as GenerateIndentifier } from './generate';
import { program } from '../utils';
// eslint-disable-next-line no-unused-vars
import { camelize, Dictionary } from 'packages/@wolf/shared/src';

export type Indentifier = {
  command: string;
  description: string;
  options: {
    flag: string;
    details: string;
    desc: string;
    default?: string | boolean;
  }[];
  action: (name: string, cmd: any, args: any) => void;
};

function cleanArgs(cmd: any) {
  const args: Dictionary = {};
  cmd.options.forEach((o: any) => {
    const key = camelize(o.long.replace(/^--/, ''));
    if (typeof cmd[key] !== 'function' && typeof cmd[key] !== 'undefined') {
      args[key] = cmd[key];
    }
  });
  return args;
}

export function generateCommander(...args: Indentifier[]) {
  return () => {
    for (const { command, description, options, action } of args) {
      const com = program.command(command).description(description);
      for (const { flag, details, desc, default: defaultValue } of options) {
        com.option(`-${flag}, --${details}, ${desc}s, ${defaultValue}`);
      }
      com.action((name, cmd) => {
        const args = cleanArgs(cmd);
        action(name, cmd, args);
      });
    }
    program.parse(process.argv);
  };
}

export const Commanders = generateCommander(GenerateIndentifier);
