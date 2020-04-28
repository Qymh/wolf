// eslint-disable-next-line no-unused-vars
import { Indentifier } from '../index';
import {
  createSchema,
  // eslint-disable-next-line no-unused-vars
  Dictionary,
  tuple,
  getConfig,
  baseConfig,
  inquirer,
  chalk,
  fs,
} from '@wolf/shared';
import { error, checkDirExisted } from '../../utils';
import path from 'path';

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

const languageValue = tuple('js', 'jsx', 'ts', 'tsx', 'vue');

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

function getFileName(name: string, args: GenerateArgs) {
  let fileName = '';
  const { type } = args;
  if (type === 'n' || type === 'nest') {
    fileName = name;
  } else if (type === 'nest-dynamic' || type === 'nd') {
    fileName = `_${name}`;
  } else if (type === 'single-dynamic' || type === 'sd') {
    fileName = '_index';
  } else {
    fileName = 'index';
  }
  return fileName;
}

async function outputFiles(
  name: string,
  fileName: string,
  config: typeof baseConfig
) {
  const { root, language, preprocessor, template } = config.cli.generate;
  const realDir = path.resolve(root, name);

  function writeFiles() {
    fs.mkdirSync(realDir);
    const mainFile = path.resolve(realDir, `${fileName}.${language}`);
    const mainCss = path.resolve(realDir, `index.${preprocessor}`);
    const base = template[language as GenerateArgs['language']](
      name,
      preprocessor
    );

    fs.outputFileSync(mainFile, base);
    if (language !== 'vue') {
      fs.outputFileSync(mainCss, '');
    }
  }

  checkDirExisted(realDir, writeFiles);
}

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
      desc: 'javascript language (js jsx ts tsx vue)',
      default: 'ts',
    },
    {
      flag: 'p',
      details: 'preprocessor <preprocessor-ext>',
      desc: 'css preprocessor (less sass scss css)',
      default: 'scss',
    },
  ],
  async action(name, cmd, args: GenerateArgs) {
    const config = getConfig();
    const { type, language, preprocessor } = config.cli.generate;
    args = { type, language, preprocessor, ...args };
    validate(args);
    config.cli.generate = { ...config.cli.generate, ...args };
    const fileName = getFileName(name, args);
    await outputFiles(name, fileName, config);
  },
};
