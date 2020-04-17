// eslint-disable-next-line no-unused-vars
import { Indentifier } from './index';

export const indentifier: Indentifier = {
  command: 'generate <directory-name>',
  description:
    'generate a new directory which contains the defaultPage and the defaultStyle',
  options: [
    {
      flag: 't',
      details: 'type <route-type>',
      desc: 'route type (single nest single-dynamic nest-dynamic)',
      default: 'single',
    },
    {
      flag: 'l',
      details: 'language <language-ext>',
      desc: 'javascript language (js or ts)',
      default: 'ts',
    },
    {
      flag: 'p',
      details: 'preprocessor <preprocessor-ext>',
      desc: 'css preprocessor (less sass scss css)',
      default: 'scss',
    },
  ],
};
