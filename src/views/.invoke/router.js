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
      component: () => import('@/index.vue'),
    },
    {
      name: 'nest',
      path: '/nest',
      component: () => import('@/nest/nest.vue'),

      children: [

        {
          name: 'nest-child',
          path: 'child',
          component: () => import('@/nest/child/index.vue'),
        },
        {
          name: 'nest-inner',
          path: 'inner',
          component: () => import('@/nest/inner/index.vue'),
        },
      ],
    },
  ],
});