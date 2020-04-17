import { indentifier as GenerateIndentifier } from './generate';
import program from 'commander';

export type Indentifier = {
  command: string;
  description: string;
  options: {
    flag: string;
    details: string;
    desc: string;
    default?: string | boolean;
  }[];
};

export function generateCommander(...args: Indentifier[]) {
  return () => {
    for (const { command, description, options } of args) {
      const com = program.command(command).description(description);
      for (const { flag, details, desc, default: defaultValue } of options) {
        com.option(`-${flag}, --${details}, ${desc}, ${defaultValue}`);
      }
    }
    program.parse(process.argv);
  };
}

export const Commanders = generateCommander(GenerateIndentifier);
