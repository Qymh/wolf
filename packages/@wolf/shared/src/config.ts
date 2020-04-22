import fs from 'fs-extra';
import path from 'path';
import { merge } from './base';

export const baseConfig = {
  cli: {
    generate: {
      dir: __dirname,
      type: 'single',
      language: 'ts',
      preprocessor: 'scss',
      template: {
        ts: (name: string, preprocessor: string) =>
          `${
            preprocessor &&
            `import './index.${preprocessor}';
`
          }
import { defineComponent, h } from 'vue';

export default defineComponent({
  name: '${name}',
  setup() {
    return () => h('div', '${name}');
  },
});
`,
        tsx: (name: string, preprocessor: string) =>
          `${
            preprocessor &&
            `import './index.${preprocessor}';
`
          }
import { defineComponent } from 'vue';

export default defineComponent({
  name: '${name}',
  setup() {
    return () => <div>${name}</div>;
  },
});
`,
        js: (name: string, preprocessor: string) =>
          baseConfig.cli.generate.template.ts(name, preprocessor),
        jsx: (name: string, preprocessor: string) =>
          baseConfig.cli.generate.template.tsx(name, preprocessor),
        vue: (name: string, preprocessor: string) =>
          `<script>
import { defineComponent } from 'vue';

export default defineComponent({
  name: '${name}',
  setup() {
    return () => <div>${name}</div>;
  },
});
</script>
${
  preprocessor &&
  `
<style lang="${preprocessor}" scoped>
</style>
  `
}
        `,
      },
    },
  },
};

export function getConfig(): typeof baseConfig {
  const context = process.cwd();
  const configNames = ['wolf.config.js', 'wolf.config.ts'];
  for (const name of configNames) {
    const file = path.resolve(context, name);
    if (fs.existsSync(file)) {
      const userConfig = require(file);
      return merge(baseConfig, userConfig);
    }
  }
  return baseConfig;
}
