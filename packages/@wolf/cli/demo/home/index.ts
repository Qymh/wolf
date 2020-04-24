import './index.scss';

import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'home',
  setup() {
    return () => h('div', 'home');
  },
});
