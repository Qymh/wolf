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
      name: 'nest',
      path: '/:nest',
      component: () => import('@/_nest/_nest.ts'),

      children: [

        {
          name: '_nest-test',
          path: '/_nest/test',
          component: () => import('@/_nest/test/index.ts'),
        },
      ],
    },
  ],
});