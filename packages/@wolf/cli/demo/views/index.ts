import { defineComponent, h } from 'vue';

export default defineComponent({
  name: 'index',
  setup() {
    return () => h('div', 'index');
  },
});
