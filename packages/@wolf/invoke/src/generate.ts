// eslint-disable-next-line no-unused-vars
import { Options } from './invoke';
// eslint-disable-next-line no-unused-vars
import { genAST, Tree, RouteTypes } from './ast';
import beautify from 'js-beautify';
import { watchFiles, outputFile } from './file';

type PushBuffer = (str: string) => void;

function createBuffer(options: Options) {
  let buffer: string = '';

  const { mode } = options;
  function push(str: string) {
    buffer += str;
  }

  function genDefaultBuffer() {
    push(`
      import vue from 'vue';
      import { createRouter, ${
        mode === 'history' ? 'createWebHistory' : 'createWebHashHistory'
      } } from 'vue-router';

      export const routerHistory = ${
        mode === 'history' ? 'createWebHistory()' : 'createWebHashHistory()'
      };
      export const router = createRouter({
        history: routerHistory,
    `);
  }

  genDefaultBuffer();

  return {
    push,
    get() {
      return beautify.js(buffer, {
        indent_size: 2,
        space_in_empty_paren: true,
      });
    },
  };
}

function genRoutesBuffer(push: PushBuffer, ast: Tree) {
  push(`
    routes: [
  `);
  genRouteBuffer(push, ast);
  push('],');
}

function genRouteBuffer(push: PushBuffer, ast: Tree) {
  const { name, path, route, aliasPath, routeType } = ast;
  const { meta, redirect } = route;
  push(`
    {
      name: '${name}',
      path: '${path}',
      component: () => import ('${aliasPath}'),
  `);
  if (meta) {
    push(`
      meta: ${JSON.stringify(meta)},
    `);
  }
  if (redirect) {
    push(`
      redirect: '${redirect}',
    `);
  }
  if (routeType & RouteTypes.SINGLE) {
    push('},');
    genRouteChildrenBuffer(push, ast.children);
  } else if (routeType & RouteTypes.NEST) {
    push(`
      children:[
    `);
    genRouteChildrenBuffer(push, ast.children);
    push('],},');
  }
}

function genRouteOptionsBuffer(push: PushBuffer, options: Options) {
  const { scrollBehavior } = options;
  if (scrollBehavior) {
    push(`
      scrollBehavior: ${scrollBehavior.toString()},
    `);
  }
}

function genRouteChildrenBuffer(push: PushBuffer, children: Tree[]) {
  for (const child of children) {
    genRouteBuffer(push, child);
  }
}

function genOptionsBuffer(push: PushBuffer, options: Options) {
  const { beforeEach, afterEach } = options;
  if (beforeEach) {
    genGlobalGuards(push, 'beforeEach', beforeEach.toString());
  }
  if (afterEach) {
    genGlobalGuards(push, 'afterEach', afterEach.toString());
  }
}

function genGlobalGuards(
  push: PushBuffer,
  type: 'beforeEach' | 'afterEach',
  beforeEach: string
) {
  push(`
    router.${type}(${beforeEach});
  `);
}

export function generate(options: Options) {
  const generatedFn = () => {
    const ast = genAST(options.dir, options);
    // console.dir(ast, { depth: null });
    if (ast) {
      const { push, get } = createBuffer(options);
      genRoutesBuffer(push, ast);
      genRouteOptionsBuffer(push, options);
      push('});');
      genOptionsBuffer(push, options);
      outputFile(options.dist!, get());
    }
  };
  watchFiles(options, generatedFn);
}
