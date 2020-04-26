import { createApp, h } from 'vue';
import { View } from 'vue-router';
import { router } from './.invoke/router';

const app = createApp({
  setup() {
    return () => h('div', 123);
  },
});

// app.use(router);
app.mount('#app');
