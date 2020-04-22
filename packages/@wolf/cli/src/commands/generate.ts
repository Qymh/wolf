// eslint-disable-next-line no-unused-vars
import { Indentifier } from './index';
import {
  createSchema,
  // eslint-disable-next-line no-unused-vars
  Dictionary,
  tuple,
  getConfig,
} from 'packages/@wolf/shared/src';
import { error } from '../utils';
// eslint-disable-next-line no-unused-vars
// import { Dictionary } from 'packages/@wolf/shared/src';

const defaultArgs = {
  type: 'single',
  language: 'ts',
  preprocessor: 'scss',
};

const typeValue = tuple(
  's',
  'single',
  'n',
  'nest',
  'sd',
  'single-dynamic',
  'nd',
  'nest-dynamic'
);

const languageValue = tuple('js', 'jsx', 'ts', 'tsx');

const preprocessorValue = tuple('css', 'less', 'sass', 'scss');

type GenerateArgs = {
  type: typeof typeValue[number];
  language: typeof languageValue[number];
  preprocessor: typeof preprocessorValue[number];
};

function validate(args: Dictionary) {
  const schema = createSchema((joi) => {
    return joi.object({
      type: joi.string().valid(...typeValue),
      language: joi.string().valid(...languageValue),
      preprocessor: joi.string().valid(...preprocessorValue),
    });
  });
  const { error: _error } = schema.validate(args);
  error(_error?.message);
}

function generateFiles(name: string, args: GenerateArgs) {
  const files = [];
  let dirName = '';
  const { type, language, preprocessor } = args;
  if (type === 'n' || type === 'nest') {
    dirName = name;
  } else if (type === 'nest-dynamic' || type === 'nd') {
    dirName = `_${name}`;
  } else if (type === 'single-dynamic' || type === 'sd') {
    dirName = '_index';
  } else {
    dirName = 'index';
  }
  files.push(`${dirName}.${language}`);
  files.push(`index.${preprocessor}`);
  return {
    dirName,
    files,
  };
}

function outputFiles(dirName: string, files: string[]) {}

export const indentifier: Indentifier = {
  command: 'generate <directory-name>',
  description:
    'generate a new directory which contains the defaultPage and the defaultStyle',
  options: [
    {
      flag: 't',
      details: 'type <route-type>',
      desc: 'route type s(single) n(nest) sd(single-dynamic) nd(nest-dynamic)',
      default: 'single',
    },
    {
      flag: 'l',
      details: 'language <language-ext>',
      desc: 'javascript language (js jsx ts tsx)',
      default: 'ts',
    },
    {
      flag: 'p',
      details: 'preprocessor <preprocessor-ext>',
      desc: 'css preprocessor (less sass scss css)',
      default: 'scss',
    },
  ],
  action(name, cmd, args: GenerateArgs) {
    const config = getConfig();
    console.log(config);
    args = { ...defaultArgs, ...args };
    validate(args);
    const { dirName, files } = generateFiles(name, args);
    outputFiles(dirName, files);
  },
};
