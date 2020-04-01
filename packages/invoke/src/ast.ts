import fs from 'fs-extra';
// eslint-disable-next-line no-unused-vars
import { isDir, isFile, isVue, isYAML } from './utils';
// eslint-disable-next-line no-unused-vars
import { Options } from './invoke';
import { error, ErrorCodes } from './error';

type DirectoryTree = {
  path: string;
  relativePath: string;
  children: Tree[];
};

type RootTree = {
  path: string;
  name: string;
  children: Tree[];
  routeType: RouteTypes;
  nestPath?: string;
};

interface Tree extends RootTree {
  DirectoryTree: DirectoryTree;
  parent?: Tree;
}

/* eslint-disable no-unused-vars */
const enum FileTypes {
  Directory = 1,
  VUE = 1 << 1,
  YAML = 1 << 2,
  UNKNOWN_FILE = 1 << 3,

  FILE = VUE | YAML | UNKNOWN_FILE,
}
/* eslint-enable no-unused-vars */

/* eslint-disable no-unused-vars */
const enum RouteTypes {
  SINGLE = 1,
  NEST = 1 << 1,
  DYNAMIC_SINGLE = 1 << 2,
  DYNAMIC_NEST = 1 << 3,
  UNKNOWN = 1 << 4,

  DYNAMIC = DYNAMIC_SINGLE | DYNAMIC_NEST,
}
/* eslint-enable no-unused-vars */

function createTree(name: string = '', path: string = '', type?: RouteTypes) {
  const tree: Tree = {
    name,
    path,
    children: [],
    routeType: type === undefined ? RouteTypes.UNKNOWN : type,
    DirectoryTree: {
      path: '',
      relativePath: '',
      children: [],
    },
  };
  return tree;
}

function isValidFileOrDir(path: string) {
  path = path.toLowerCase();
  return (
    isVue(path) ||
    isYAML(path) ||
    path.includes('index.js') ||
    path.includes('index.jsx') ||
    path.includes('index.ts') ||
    path.includes('index.tsx')
  );
}

const rootTree = createTree('index', '/', RouteTypes.SINGLE);

function patch(path: string, options: Options, tree: Tree) {
  const res = fs.readdirSync(path);
  for (const value of res) {
    const realPath = `${path}/${value}`;
    if (isDir(realPath)) {
      tree.children.push(processDirectory(realPath, options, tree));
    } else if (isFile(realPath)) {
      processFile(realPath, options, tree);
    }
  }
}

function processFile(path: string, options: Options, tree: Tree) {
  if (isValidFileOrDir(path) && tree.name !== 'index') {
    const relativePath = options.getRelativePath!(path);
    const { DirectoryTree } = tree;
    const DirectoryTreeRelativePath = DirectoryTree.relativePath;
    const routeType = checkRouteTypes(relativePath, DirectoryTreeRelativePath);
    tree.routeType = routeType;
    let nestPath = getNestPath(tree);
    tree.name = pathToName(DirectoryTreeRelativePath);
    tree.path = DirectoryTreeRelativePath;
    if (nestPath) {
      if (routeType & RouteTypes.DYNAMIC_SINGLE) {
        nestPath = nestPath.replace(/:/g, '_');
        tree.path = DirectoryTreeRelativePath.replace(nestPath, '');
      } else {
        tree.path = DirectoryTreeRelativePath.replace(nestPath, '').slice(1);
      }
    }
    if (routeType & RouteTypes.DYNAMIC) {
      tree.name = toDynamicName(tree.name);
      tree.path = toDynamicPath(tree.path);
      if (routeType === RouteTypes.DYNAMIC_NEST) {
        tree.nestPath = tree.path;
      }
    } else {
      if (routeType === RouteTypes.NEST) {
        tree.nestPath = DirectoryTreeRelativePath;
      }
    }
  }
}

function toDynamicName(path: string) {
  return path.replace(/_/g, '');
}

function toDynamicPath(path: string) {
  return path.replace(/\/_/g, '/:');
}

function pathToArr(path: string) {
  return path.split('/').filter(Boolean);
}

function pathToName(path: string) {
  return path.split('/').filter(Boolean).join('-');
}

function isDynamicPath(path: string) {
  return /^_.+/.test(path);
}

function getNestPath(tree: Tree) {
  if (!tree.parent) {
    return false;
  }
  while (tree.parent) {
    if (
      tree.parent.routeType === RouteTypes.NEST ||
      tree.parent.routeType === RouteTypes.DYNAMIC_NEST
    ) {
      return tree.parent.nestPath;
    }
    if (tree.parent.parent) {
      tree.parent = tree.parent.parent;
    } else {
      break;
    }
  }
}

function checkRouteTypes(path: string, parentPath: string) {
  const pathArr = pathToArr(path);
  const pathArrLast = pathArr[pathArr.length - 1];
  const parentPathArr = pathToArr(parentPath);
  const parentPathArrLast = parentPathArr[parentPathArr.length - 1];
  const simpleType = checkSimpleRouteTypes(pathArrLast, parentPathArrLast);
  if (pathArr.some((v) => isDynamicPath(v))) {
    if (simpleType === RouteTypes.SINGLE) {
      return RouteTypes.DYNAMIC_SINGLE;
    } else if (simpleType === RouteTypes.NEST) {
      return RouteTypes.DYNAMIC_NEST;
    } else {
      return simpleType;
    }
  }
  return simpleType;
}

function checkSimpleRouteTypes(pathArrLast: string, parentPathArrLast: string) {
  if (pathArrLast === parentPathArrLast) {
    return RouteTypes.NEST;
  } else if (pathArrLast === 'index') {
    return RouteTypes.SINGLE;
  }
  return RouteTypes.UNKNOWN;
}

function processDirectory(path: string, options: Options, parent: Tree) {
  const tree = createTree();
  const relativePath = options.getRelativePath!(path);
  tree.DirectoryTree = {
    path,
    relativePath,
    children: [],
  };
  tree.parent = parent;
  patch(path, options, tree);
  return tree;
}

export function genAST(base: string, options: Options) {
  if (!isDir(base)) {
    error(ErrorCodes.NOT_A_DIR, `the dir option ${base}`);
    return;
  }
  patch(base, options, rootTree);
  // console.dir(rootTree, { depth: null });
}
