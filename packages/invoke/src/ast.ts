import fs from 'fs-extra';
// eslint-disable-next-line no-unused-vars
import { isDir, isFile, isVue, replacePostfix, camelize } from './utils';
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
};

interface Tree extends RootTree {
  DirectoryTree: DirectoryTree;
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
  SINGLE,
  DYNAMIC,
  NEST,
  EMPTY,
}
/* eslint-enable no-unused-vars */

function createTree(name: string = '', path: string = '') {
  const tree: Tree = {
    name: name,
    path: name,
    children: [],
    routeType: RouteTypes.EMPTY,
    DirectoryTree: {
      path: '',
      relativePath: '',
      children: [],
    },
  };
  return tree;
}

const rootTree = [] as RootTree[];

function patch(path: string, options: Options, parentTree?: Tree) {
  const res = fs.readdirSync(path);
  for (const value of res) {
    const realPath = `${path}/${value}`;
    if (isDir(realPath)) {
      processDirectory(realPath, options);
      return;
    }
    if (isFile(realPath)) {
      processFile(realPath, options, parentTree);
    }
  }
}

function processFile(path: string, options: Options, parerntTree?: Tree) {
  if (options.isValidFileOrDir!(path)) {
    const relativePath = options.getRelativePath!(path);
    // home page
    if (!parerntTree) {
      if (relativePath.toLowerCase() === 'index') {
        const IndexTree = createTree('index', '/');
        IndexTree.routeType = RouteTypes.SINGLE;
        rootTree.push(IndexTree);
      }
      return;
    }
    const { DirectoryTree } = parerntTree;
    parerntTree.routeType = checkRouteTypes(
      relativePath,
      DirectoryTree.relativePath
    );
    // const realName = replacePostfix(relativePath.slice(1));
    // checkRouteTypes(relativePath, DirectoryTree.relativePath);
    // parerntTree.name = DirectoryTree.path;
    // parerntTree.path = DirectoryTree.relativePath;
    // console.log(parerntTree);
  }
}

function pathToArr(path: string) {
  return path.split('/').filter(Boolean);
}

function checkRouteTypes(path: string, parentPath: string) {
  const pathArr = pathToArr(path);
  const pathArrLen = pathArr.length - 1;
  const parentPathArr = pathToArr(parentPath);
  const parentPathArrLen = parentPathArr.length - 1;
  if (pathArr[pathArrLen] === parentPathArr[parentPathArrLen]) {
    return RouteTypes.NEST;
  } else if (pathArr[pathArrLen] === 'index') {
    return RouteTypes.SINGLE;
  }
  return RouteTypes.EMPTY;
}

function processDirectory(path: string, options: Options) {
  const tree = createTree();
  const relativePath = options.getRelativePath!(path);
  tree.DirectoryTree = {
    path,
    relativePath,
    children: [],
  };
  patch(path, options, tree);
}

// export function processVue(path: string, parentTree?: Tree) {}

export function genAST(base: string, options: Options) {
  if (!isDir(base)) {
    error(ErrorCodes.NOT_A_DIR, `the dir option ${base}`);
    return;
  }
  patch(base, options);
}
