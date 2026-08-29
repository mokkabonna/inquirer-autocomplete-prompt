import { execFileSync } from 'node:child_process';
import { mkdtempSync, mkdirSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const workspaceRoot = fileURLToPath(new URL('..', import.meta.url));
const packageDirectory = join(
  workspaceRoot,
  'packages',
  'inquirer-autocomplete-standalone'
);
const temporaryDirectory = mkdtempSync(
  join(tmpdir(), 'inquirer-autocomplete-standalone-')
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
  writeFileSync(
    join(consumerDirectory, 'index.ts'),
    [
      "import autocomplete, { Separator } from 'inquirer-autocomplete-standalone';",
      "import type { AutocompleteConfig, Choice } from 'inquirer-autocomplete-standalone';",
      '',
      "const choices: Choice<string>[] = [{ value: 'Norway' }];",
      'const config: AutocompleteConfig<string> = {',
      "  message: 'Country',",
      '  source: () => choices,',
      '};',
      '',
      'void autocomplete;',
      'void Separator;',
      'void config;',
      '',
    ].join('\n')
  );

  execFileSync(npm, ['install', '--ignore-scripts', '--no-package-lock', tarball], {
    cwd: consumerDirectory,
    stdio: 'inherit',
  });

  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '--eval',
      "import autocomplete, { Separator } from 'inquirer-autocomplete-standalone'; if (typeof autocomplete !== 'function' || typeof Separator !== 'function') process.exitCode = 1;",
    ],
    { cwd: consumerDirectory, stdio: 'inherit' }
  );

  execFileSync(
    process.execPath,
    [
      join(workspaceRoot, 'node_modules', 'typescript', 'bin', 'tsc'),
      '--noEmit',
      '--module',
      'Node16',
      '--moduleResolution',
      'Node16',
      '--skipLibCheck',
      'index.ts',
    ],
    { cwd: consumerDirectory, stdio: 'inherit' }
  );
} finally {
  rmSync(temporaryDirectory, { force: true, recursive: true });
}
