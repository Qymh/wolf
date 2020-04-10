import fs from 'fs-extra';
import cr from 'chokidar';
import { isValidFile } from './ast';
import { isYAML, clearConsole } from './utils';
import { Options } from './invoke';

let hasWatched = false;

function isInvokePath(path: string) {
  return /\.invoke/.test(path);
}

export function watchFiles({ dir, dist }: Options, fn: any) {
  function finish() {
    clearConsole(dist!);
    fn();
  }
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
            finish();
          }
        }
        // file
        else if (details.type === 'file') {
          // force update when file is yaml
          if (isYAML(path)) {
            finish();
          } else {
            if (
              (events === 'created' || events === 'moved') &&
              isValidFile(path)
            ) {
              finish();
            }
          }
        }
      }
    });

    // process at the first time
    finish();
  }
}

export function outputFile(dist: string, buffer: string) {
  fs.outputFileSync(dist, buffer);
}
