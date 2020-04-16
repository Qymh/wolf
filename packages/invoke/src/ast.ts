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
import yaml from 'js-yaml';

type DirectoryTree = {
  path: string;
  relativePath: string;
  children: Tree[];
  defaultPage: string;
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

type Route = {
  meta?: Record<string, any>;
  redirect?: string;
};

export interface Tree extends RootTree {
  DirectoryTree: DirectoryTree;
  parent?: Tree;
  route: Route;
}

/* eslint-disable no-unused-vars */
export const enum RouteTypes {
  SIMPLE_SINGLE = 1,
  DYNAMIC_SINGLE = 1 << 2,

  SIMPLE_NEST = 1 << 3,
  DYNAMIC_NEST = 1 << 4,

  SINGLE = SIMPLE_SINGLE | DYNAMIC_SINGLE,
  NEST = SIMPLE_NEST | DYNAMIC_NEST,
  DYNAMIC = DYNAMIC_SINGLE | DYNAMIC_NEST,
  UNKNOWN = 1 << 4,
}
/* eslint-enable no-unused-vars */

function createTree(name: string = '', path: string = '', type?: RouteTypes) {
  const tree: Tree = {
    name,
    path,
    route: {},
    filePath: '',
    aliasPath: '',
    children: [],
    routeType: type === undefined ? RouteTypes.UNKNOWN : type,
    DirectoryTree: {
      path: '',
      relativePath: '',
      children: [],
      defaultPage: '',
    },
  };
  return tree;
}

function getBasename(path: string) {
  return /\/([^/]+)$/.exec(path)![1].toLowerCase();
}

function getDefaultPage(path: string): string {
  // can not name directory as index
  if (/(index|route)$/i.test(path)) {
    error(ErrorCodes.WRONG_DIR_NAME, `Error in ${path}`);
    return '';
  }
  const baseName = getBasename(path);
  const res = fs.readdirSync(path);
  const checkRes = res.filter((v) => isValidFile(v));
  const checkResTrip = checkRes.map((v) => replacePostfix(v).toLowerCase());
  if (checkResTrip.length === 0) {
    return '';
  } else if (checkResTrip.length === 1) {
    if (checkResTrip[0] === 'index' || checkResTrip[0] === baseName) {
      return checkRes[0];
    } else {
      return '';
    }
  } else if (checkResTrip.length >= 2) {
    if (checkResTrip.includes('index') && checkResTrip.includes(baseName)) {
      errorForMultiplePage(path, checkRes);
      return '';
    } else if (checkResTrip.includes('index')) {
      const index = checkResTrip.indexOf('index');
      return checkRes[index];
    } else if (checkResTrip.includes(baseName)) {
      const index = checkResTrip.indexOf(baseName);
      return checkRes[index];
    }
  }
  return '';
}

export function isValidFile(path: string) {
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

function toDynamicName(path: string) {
  return path.replace(/^_/g, '').replace(/-_/g, '-');
}

function toDynamicPath(path: string) {
  return path.replace(/^_/g, ':').replace(/\/_/g, '/:');
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

function checkRouteTypes(path: string, parentPath: string) {
  const pathArr = pathToArr(path);
  const pathArrLast = pathArr[pathArr.length - 1];
  const parentPathArr = pathToArr(parentPath);
  const parentPathArrLast = parentPathArr[parentPathArr.length - 1];
  const simpleType = checkSimpleRouteTypes(pathArrLast, parentPathArrLast);
  if (isDynamicPath(pathArrLast)) {
    if (simpleType === RouteTypes.SIMPLE_SINGLE) {
      return RouteTypes.DYNAMIC_SINGLE;
    } else if (simpleType === RouteTypes.SIMPLE_NEST) {
      return RouteTypes.DYNAMIC_NEST;
    } else {
      return simpleType;
    }
  }
  return simpleType;
}

function checkSimpleRouteTypes(pathArrLast: string, parentPathArrLast: string) {
  if (pathArrLast === parentPathArrLast) {
    return RouteTypes.SIMPLE_NEST;
  } else if (pathArrLast === 'index') {
    return RouteTypes.SIMPLE_SINGLE;
  }
  return RouteTypes.UNKNOWN;
}

function setTreePath(tree: Tree, filePath: string) {
  tree.filePath = filePath;
  tree.aliasPath = filePath.replace(process.env.WOLF_INVOKE_DIR, '@');
}

function processDirectory(path: string, options: Options, parent: Tree) {
  const defaultPage = getDefaultPage(path);
  if (!defaultPage) {
    return;
  }
  const tree = createTree();
  const relativePath = options.getRelativePath!(path);
  tree.DirectoryTree = {
    path,
    relativePath,
    children: [],
    defaultPage,
  };
  tree.parent = parent;
  parent.children.push(tree);
  patch(path, options, tree);
  return tree;
}

function processFile(path: string, options: Options, tree: Tree) {
  if (isValidFile(path) && tree.name !== 'index') {
    const { DirectoryTree } = tree;
    const baseName = getBasename(path);
    if (baseName === DirectoryTree.defaultPage.toLowerCase()) {
      processPage(path, options, tree);
    } else if (isYAML(baseName)) {
      processYAML(path, tree);
    }
  }
}

function processYAML(path: string, tree: Tree) {
  const res = fs.readFileSync(path).toString();
  try {
    const route = yaml.safeLoad(res);
    tree.route = route || {};
  } catch (err) {
    tree.route = {};
    error(ErrorCodes.WRONG_PARSE_YML, path, '', err.message);
  }
}

function findParentNestPath(tree: Tree) {
  let vm = tree;
  while (vm.parent) {
    if (vm.parent.routeType & RouteTypes.NEST) {
      return vm.parent.path;
    }
    vm = vm.parent;
  }
}

function processPage(path: string, options: Options, tree: Tree) {
  const relativePath = options.getRelativePath!(path);
  const { DirectoryTree } = tree;
  const DirectoryTreeRelativePath = DirectoryTree.relativePath;
  // console.log(relativePath, DirectoryTreeRelativePath);
  const routeType = checkRouteTypes(relativePath, DirectoryTreeRelativePath);
  tree.routeType = routeType;
  const nestPath = findParentNestPath(tree);

  // set base name and base path
  tree.name = pathToName(DirectoryTreeRelativePath);
  tree.path = DirectoryTreeRelativePath;
  setTreePath(tree, path);

  // dynamic route
  if (routeType & RouteTypes.DYNAMIC) {
    tree.name = toDynamicName(tree.name);
    tree.path = toDynamicPath(tree.path);
    if (routeType === RouteTypes.DYNAMIC_NEST) {
      tree.nestPath = tree.path;
      if (nestPath) {
        tree.path = tree.path.replace(nestPath, '').slice(1);
      }
    } else {
      if (nestPath) {
        tree.path = tree.path.replace(nestPath, '').slice(1);
      }
    }
  }

  // nested route
  else if (routeType & RouteTypes.NEST) {
    tree.nestPath = DirectoryTreeRelativePath;
    if (nestPath) {
      tree.path = tree.path.replace(nestPath, '').slice(1);
    }
  }

  // single route
  else {
    if (nestPath) {
      // tree.path = tree.path.replace(nestPath, '').slice(1);
      // if (routeType & RouteTypes.DYNAMIC_SINGLE) {
      //   nestPath = nestPath.replace(/:/g, '_');
      // }
      // tree.nestPath = DirectoryTreeRelativePath;
    }
  }
}

function sortFileFrontOfDir(pathArr: string[]) {
  return pathArr.sort((a, b) => {
    const fileA = /\.[a-zA-Z]+$/.test(a) ? 1 : -1;
    const fileB = /\.[a-zA-Z]+$/.test(b) ? 1 : -1;
    return fileB - fileA;
  });
}

function patch(path: string, options: Options, tree: Tree) {
  const res = sortFileFrontOfDir(fs.readdirSync(path));
  for (const value of res) {
    const absolutePath = `${path}/${value}`;
    if (isDir(absolutePath)) {
      processDirectory(absolutePath, options, tree);
    } else if (isFile(absolutePath)) {
      processFile(absolutePath, options, tree);
    }
  }
}

export function genAST(
  dir: string,
  options: Options
): Tree | never | undefined {
  if (!isDir(dir)) {
    error(ErrorCodes.NOT_A_DIR, `the dir option ${dir}`);
    process.exit(1);
  }
  const defaultPage = getDefaultPage(dir);
  if (defaultPage) {
    const rootTree = createTree('index', '/', RouteTypes.SIMPLE_SINGLE);
    setTreePath(rootTree, dir + '/' + defaultPage);
    rootTree.DirectoryTree.defaultPage = defaultPage;
    patch(dir, options, rootTree);
    return rootTree;
  } else {
    error(ErrorCodes.NOT_HAS_HOME, dir);
    return undefined;
  }
}
