import { createApp } from 'vue';
import App from './App.vue';
import { router } from '../.wolf/.invoke/router';

const app = createApp(App, {
  router
});

app.use(router);
app.mount('#app');
