import { indentifier as GenerateIndentifier } from './generate/index';
import { indentifier as ServeIndentifier } from './serve';
import { indentifier as CreateIndentifier } from './create';
import { indentifier as BuildIndentifier } from './build';
import { indentifier as AddIndentifier } from './add';
import {
  program,
  camelize,
  Dictionary,
  getConfig,
  baseConfig
} from '@wolf/shared';
import Config from 'webpack-chain';

export type IndentifierAction = {
  name: string;
  args: any;
  chainConfig: Config;
  config: typeof baseConfig;
};

export type Indentifier = {
  command: string;
  description: string;
  options: {
    flag: string;
    details: string;
    desc: string;
    default?: string | boolean;
  }[];
  action: (arg: IndentifierAction) => void | Promise<any>;
};

function cleanArgs(cmd: any) {
  const args: Dictionary = {};
  if (!cmd) {
    return args;
  }
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
        const chainConfig = new Config();
        const config = getConfig();
        const args = cleanArgs(cmd);
        action({
          name,
          args,
          chainConfig,
          config
        });
      });
    }
    program.parse(process.argv);
  };
}

export const Commanders = generateCommander(
  GenerateIndentifier,
  ServeIndentifier,
  CreateIndentifier,
  BuildIndentifier,
  AddIndentifier
);
