# @wolf/invoke

Automatic generate routes of `vue-router` based on the directory

## Usage

### Download

```yaml
yarn add @wolf/invoke
```

## Cite

If you are using `@wolf/cli`, you need't to cite it, because we cite it in the default mode

### Cite In Webpack

webpack.config.js

```js
const Invoke = require('@wolf/invoke');

module.exports = {
  // omit some options
  mode: ...,
  entry: ...,

  // you need set alias path the same as Invoke's root option
  resolve:{
    alias:{
      '@': ROOT
    }
  }

  // Cite at here
  plugins:[
    new Invoke({
      root: ROOT // should be the same as resolve.alias.@
    })
  ]
}
```

The `ROOT` option which means the aim directory to be watched,for an example

```tree
src
├── app.vue
├── main.js
└── views
    ├── index.vue
    ├── shop
    │   └── index.vue
    └── user
        └── index.vue
```

`path.resolve(process.cwd(), 'src/views')` should be the `root` path which be watched to generate routes for `vue-router`

## How to Generate Routes

We split routes into `Single` `Dynamic` and `Nested` route

The below examples depends on the same options

webpack.config.js

```js
const Invoke = require('@wolf/invoke');
const path = require('path');

module.exports = {
  // omit some options
  mode: ...,
  entry: ...,

  // you [must] set alias path the same as Invoke's root option
  resolve:{
    alias:{
      '@': path.resolve(process.cwd(), 'src/views')
    }
  }

  // Cite at here
  plugins:[
    new Invoke({
      root: path.resolve(process.cwd(), 'src/views') // should be the same as resolve.alias.@
    })
  ]
}
```

### Single

A directory which has a file called `index.vue`(no sensitive to capital and small letter) can be translated to single route

```tree
src
├── app.vue
├── main.js
└── views
    ├── index.vue
    ├── shop
    │   ├── index.vue
    │   └── star
    │       └── index.vue
    └── user
        └── index.vue
```

The routes will be auto generated to the file `src/views/.invoke/router.js`

You can change the default output dir by using the `outputDir` option

src/views/.invoke/router.js

```js
import { createRouter, createWebHistory } from 'vue-router';

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
      name: 'shop',
      path: '/shop',
      component: () => import('@/shop/index.vue'),
    },
    {
      name: 'shop-star',
      path: '/shop/star',
      component: () => import('@/shop/star/index.vue'),
    },
    {
      name: 'user',
      path: '/user',
      component: () => import('@/user/index.vue'),
    },
  ],
});
```

### Dynamic

A directory which start with `_` and has a file which called `index.vue` can be translated to dynamic route

```tree
src
├── app.vue
├── main.js
└── views
    ├── _user
    │   └── index.vue
    ├── index.vue
    └── shop
        ├── _star
        │   └── index.vue
        └── index.vue
```

src/views/.invoke/router.js

```js
import { createRouter, createWebHistory } from 'vue-router';

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
      name: 'user',
      path: '/:user',
      component: () => import('@/_user/index.vue'),
    },
    {
      name: 'shop',
      path: '/shop',
      component: () => import('@/shop/index.vue'),
    },
    {
      name: 'shop-star',
      path: '/shop/:star',
      component: () => import('@/shop/_star/index.vue'),
    },
  ],
});
```

### Nested

A directory has the same name as its first file will be translated to nested route

```tree
src
├── app.vue
├── main.js
└── views
    ├── index.vue
    └── nest
        ├── child
        │   └── index.vue
        ├── inner
        │   └── index.vue
        └── nest.vue
```

src/views/.invoke/router.js

```js
import { createRouter, createWebHistory } from 'vue-router';

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
```

## Route Options

route options just like `meta` `redirect` you can set by using `route.yml`

```tree
src
├── app.vue
├── main.js
└── views
    ├── index.vue
    └── single
        ├── index.vue
        └── route.yml
```

route.yml

```yaml
meta:
  number: 123
  string: 'string'
  boolean: true

redirect: '/test'
```

src/views/.invoke/router.js

```js
import { createRouter, createWebHistory } from 'vue-router';

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
      name: 'single',
      path: '/single',
      component: () => import('@/single/index.vue'),

      meta: {
        number: 123,
        string: 'string',
        boolean: true,
      },

      redirect: '/test',
    },
  ],
});
```

## Guard Options

global guards of `vue-router` you can set it by `Invoke` Options

webpack.config.js

```js
const Invoke = require('@wolf/invoke');
const path = require('path');

module.exports = {
  // omit some options
  mode: ...,
  entry: ...,

  // you [must] set alias path the same as Invoke's root option
  resolve:{
    alias:{
      '@': path.resolve(process.cwd(), 'src/views')
    }
  }

  // Cite at here
  plugins:[
    new Invoke({
      root: path.resolve(process.cwd(), 'src/views'), // should be the same as resolve.alias.@
      beforeEach(to, from, next) {
        next();
      },
      afterEach(to, from) {},
      scrollBehavior(to, from, savedPosition) {
        if (savedPosition) {
          return savedPosition;
        } else {
          return { x: 0, y: 0 };
        }
      },
    })
  ]
}
```

```tree
src
├── app.vue
├── main.js
└── views
    └── index.vue
```

src/views/.invoke/router.js

```js
import { createRouter, createWebHistory } from 'vue-router';

export const routerHistory = createWebHistory();
export const router = createRouter({
  history: routerHistory,
  routes: [
    {
      name: 'index',
      path: '/',
      component: () => import('@/index.vue'),
    },
  ],
  scrollBehavior: function scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    } else {
      return {
        x: 0,
        y: 0,
      };
    }
  },
});
router.beforeEach(function beforeEach(to, from, next) {
  next();
});

router.afterEach(function afterEach(to, from) {});
```
