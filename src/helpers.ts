import * as path from 'path';
import * as fs from 'fs';

export function makeDir(name: string): string {
  const dirpath = path.join(path.resolve(), name);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
  }
  return dirpath;
}
