import './index.scss';

import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'nest',
  setup() {
    return () => h('div', 'nest');
  },
});
