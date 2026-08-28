import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));
const packageDirectory = join(
  workspaceRoot,
  'packages',
  'inquirer-autocomplete-prompt'
);
const temporaryDirectory = mkdtempSync(
  join(tmpdir(), 'inquirer-autocomplete-prompt-')
);
const consumerDirectory = join(temporaryDirectory, 'consumer');
const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';

try {
  const packedPackage = JSON.parse(
    execFileSync(
      npm,
      ['pack', '--json', '--pack-destination', temporaryDirectory],
      { cwd: packageDirectory, encoding: 'utf8' }
    )
  )[0];
  const tarball = join(temporaryDirectory, packedPackage.filename);

  mkdirSync(consumerDirectory);
  writeFileSync(
    join(consumerDirectory, 'package.json'),
    JSON.stringify({ private: true, type: 'module' })
  );

  execFileSync(
    npm,
    [
      'install',
      '--ignore-scripts',
      '--no-package-lock',
      tarball,
      'inquirer@^9.1.0',
    ],
    { cwd: consumerDirectory, stdio: 'inherit' }
  );

  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      "import inquirer from 'inquirer'; import autocomplete from 'inquirer-autocomplete-prompt'; inquirer.registerPrompt('autocomplete', autocomplete);",
    ],
    { cwd: consumerDirectory, stdio: 'inherit' }
  );
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
