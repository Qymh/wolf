import fs from 'fs-extra';
import cr from 'chokidar';
import { isValidFile } from './ast';
import { isYAML } from './utils';

let hasWatched = false;

function isInvokePath(path: string) {
  return /\.invoke/.test(path);
}

export function watchFiles(dir: string, fn: any) {
  if (!hasWatched) {
    hasWatched = true;
    const watcher = cr.watch(dir, {
      persistent: true,
      awaitWriteFinish: {
        stabilityThreshold: 2000,
        pollInterval: 100,
      },
    });
    watcher.on('raw', (events, path, details) => {
      if (!isInvokePath(path)) {
        // directory
        if (details.type === 'directory') {
          if (events === 'created' || events === 'moved') {
            fn();
          }
        }
        // file
        else if (details.type === 'file') {
          // force update when file is yaml
          if (isYAML(path)) {
            fn();
          } else {
            if (
              (events === 'created' || events === 'moved') &&
              isValidFile(path)
            ) {
              fn();
            }
          }
        }
      }
    });

    // process at the first time
    fn();
  }
}

export function outputFile(dist: string, buffer: string) {
  fs.outputFileSync(dist, buffer);
}
