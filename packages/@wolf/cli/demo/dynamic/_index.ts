import './index.scss';

import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'dynamic',
  setup() {
    return () => h('div', 'dynamic');
  },
});
