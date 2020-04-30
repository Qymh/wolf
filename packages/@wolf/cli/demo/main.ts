import { createApp, h } from 'vue';
import { router } from './.invoke/router';
import { View } from 'vue-router';

const app = createApp({
  setup() {
    return () => h(View);
  }
});

app.use(router);
app.mount('#app');
