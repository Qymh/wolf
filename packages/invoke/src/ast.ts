import fs from 'fs-extra';
// eslint-disable-next-line no-unused-vars
import {
  isDir,
  isFile,
  isVue,
  isYAML,
  replacePostfix,
  isJsOrTs,
} from './utils';
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
  filePath: string;
  aliasPath: string;
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
    filePath: '',
    aliasPath: '',
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
  return isVue(path) || isYAML(path) || isJsOrTs(path);
}

function errorForMultiplePage(path: string, args: string[]) {
  error(
    ErrorCodes.MULTIPLE_PAGE,
    undefined,
    undefined,
    `but now get ${args.join(' ')} where in ${path}`
  );
}

const rootTree = createTree('index', '/', RouteTypes.SINGLE);

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

function isInvokeDirFn(base: string, checkRes: string[]): boolean {
  // home page
  if (base === process.env.WOLF_INVOKE_DIR) {
    return true;
  }
  checkRes = checkRes.map((v) => replacePostfix(v).toLowerCase());
  const baseName = /\/([^/]+)$/.exec(base)![1].toLowerCase();
  // single page index.vue index.js index.ts and so on or nest page
  if (
    checkRes.length === 1 &&
    (checkRes[0] === 'index' || checkRes[0] === baseName)
  ) {
    return true;
  }
  if (
    checkRes.length > 1 &&
    (checkRes.includes('index') || checkRes.includes(baseName))
  ) {
    return true;
  }
  return false;
}

function checkPath(base: string) {
  if (/index$/i.test(base)) {
    error(ErrorCodes.WRONG_DIR_NAME, `Error in ${base}`);
  }
  const res = fs.readdirSync(base);
  const checkRes = res.filter((v) => isValidFileOrDir(v));
  const isInvokeDir = isInvokeDirFn(base, checkRes);
  if (isInvokeDir) {
    if (checkRes.length === 0) {
      error(ErrorCodes.NOT_HAS_HOME, undefined, undefined, `where in ${base}`);
    } else if (checkRes.length > 1) {
      const postFix = Array.from(
        new Set(checkRes.map((v) => v.match(/\.(\w+)$/)![1]))
      );
      // console.log(checkRes);
      if (postFix.length === 1) {
        errorForMultiplePage(base, checkRes);
        return [];
      }
      return [];
    } else {
      return checkRes;
    }
  } else {
    return [];
  }
}

function setTreePath(tree: Tree, filePath: string) {
  tree.filePath = filePath;
  tree.aliasPath = filePath.replace(process.env.WOLF_INVOKE_DIR, '@');
}

function processDirectory(path: string, options: Options, parent: Tree) {
  const checkRes = checkPath(path);
  if (checkRes?.length === 0) {
    return;
  }
  const tree = createTree();
  const relativePath = options.getRelativePath!(path);
  tree.DirectoryTree = {
    path,
    relativePath,
    children: [],
  };
  tree.parent = parent;
  parent.children.push(tree);
  patch(path, options, tree);
  return tree;
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
    setTreePath(tree, path);
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

function patch(path: string, options: Options, tree: Tree) {
  const res = fs.readdirSync(path);
  for (const value of res) {
    const absolutePath = `${path}/${value}`;
    if (isDir(absolutePath)) {
      processDirectory(absolutePath, options, tree);
    } else if (isFile(absolutePath)) {
      processFile(absolutePath, options, tree);
    }
  }
}

export function genAST(dir: string, options: Options) {
  if (!isDir(dir)) {
    error(ErrorCodes.NOT_A_DIR, `the dir option ${dir}`);
    return;
  }
  const checkRes = checkPath(dir);
  setTreePath(rootTree, dir + '/' + checkRes![0]);
  patch(dir, options, rootTree);
  // console.dir(rootTree, { depth: null });
}
