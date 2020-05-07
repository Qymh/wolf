import { Plugin } from '@wolf/shared';

const index: Plugin = ({ chainConfig, config }) => {
  if (chainConfig && config) {
    // invoke
    chainConfig.plugin('invoke').use(require('@wolf/invoke'), [config.invoke]);
  }
};

export default index;
