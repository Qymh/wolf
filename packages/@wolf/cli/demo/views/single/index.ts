import './index.scss';

import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'single',
  setup() {
    return () =>
      h(
        'div',
        {
          class: 'test'
        },
        'single'
      );
  }
});
