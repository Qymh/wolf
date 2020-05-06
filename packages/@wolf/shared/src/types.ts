import Config from 'webpack-chain';
import { baseConfig } from './config';

export type PluginConfig = {
  chainConfig: Config;
  config: typeof baseConfig;
};

export type Plugin = (config: PluginConfig) => any;
