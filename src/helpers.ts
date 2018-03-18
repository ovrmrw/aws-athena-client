import * as path from 'path';
import * as fs from 'fs';

export function makeDir(name: string): string {
  const dirpath = path.join(path.resolve(), name);
  if (!fs.existsSync(dirpath)) {
    fs.mkdirSync(dirpath);
  }
  return dirpath;
}

export function getQuery(filename: string): string {
  const filepath = path.join(__dirname, filename);
  return fs.readFileSync(filepath).toString();
}
