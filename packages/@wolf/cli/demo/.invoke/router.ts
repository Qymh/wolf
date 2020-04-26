import vue from 'vue';
import {
  createRouter,
  createWebHistory
} from 'vue-router';

export const routerHistory = createWebHistory();
export const router = createRouter({
  history: routerHistory,

  routes: [

    {
      name: 'index',
      path: '/',
      component: () => import('@/index.ts'),
    },
    {
      name: 'home',
      path: '/home',
      component: () => import('@/home/index.vue'),
    },
  ],
});