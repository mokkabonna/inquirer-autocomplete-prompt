import { writeFile } from 'node:fs/promises';

Promise.all([
  writeFile(
    './dist/esm/package.json',
    JSON.stringify({ type: 'module' }, null, 2),
    'utf8'
  ),
  writeFile(
    './dist/cjs/package.json',
    JSON.stringify({ type: 'commonjs' }, null, 2),
    'utf8'
  ),
]);
