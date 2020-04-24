import { createApp, h } from 'vue';

const app = createApp({
  setup() {
    return () => h('div', 123);
  },
});

app.mount('#app');
