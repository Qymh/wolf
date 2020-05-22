import { createApp } from 'vue';
import App from './App.vue';
import { router } from '../.wolf/.invoke/router';
import store from './store';

const app = createApp(App, {
  router
});

app.use(store);
app.use(router);
app.mount('#app');
