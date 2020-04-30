import { defineComponent, h } from 'vue';
import { View } from 'vue-router';

import './index.scss';

export default defineComponent({
  setup(props) {
    return () => h(View);
  }
});
