import { defineComponent, h } from 'vue';
import { View } from 'vue-router';

export default defineComponent({
  setup(props) {
    return () => h(View);
  },
});
