import Config from 'webpack-chain';
import { baseConfig } from './config';
import { Dictionary } from './base';

export type PluginConfig = {
  chainConfig?: Config;
  config?: typeof baseConfig;
  pkg?: Dictionary;
  dir?: string;
};

export type Plugin = (config: PluginConfig) => any;
