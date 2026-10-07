import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { runInNewContext } from 'node:vm';

const directory = mkdtempSync(join(tmpdir(), 'sounds-control-package-'));
try {
  const [pack] = JSON.parse(
    execFileSync('npm', ['pack', '--json', '--pack-destination', directory], {
      encoding: 'utf8',
    })
  );
  const files = pack.files.map((file) => file.path);
  for (const path of [
    'dist/index.js',
    'dist/index.cjs',
    'dist/index.d.ts',
    'dist/sounds-control.d.ts',
    'dist/index.umd.cjs',
    'README.md',
    'docs/pt-br/README.md',
    'docs/hi/README.md',
    'docs/es/README.md',
    'docs/ru/README.md',
    'docs/zh/README.md',
    'SECURITY.md',
    'CODE_OF_CONDUCT.md',
  ])
    assert.ok(files.includes(path), `Missing ${path}`);
  assert.ok(
    files.every((path) => !/^(src|tests|node_modules|\.husky)\//.test(path))
  );
  writeFileSync(
    join(directory, 'package.json'),
    '{"private":true,"type":"module"}'
  );
  execFileSync(
    'npm',
    [
      'install',
      '--ignore-scripts',
      '--no-audit',
      '--no-fund',
      join(directory, pack.filename),
    ],
    { cwd: directory, stdio: 'pipe' }
  );
  execFileSync(
    process.execPath,
    [
      '--input-type=module',
      '-e',
      "import { SoundsControl } from 'sounds-control'; if (new SoundsControl().getState('x') !== 'unloaded') throw Error('ESM');",
    ],
    { cwd: directory }
  );
  execFileSync(
    process.execPath,
    [
      '-e',
      "const { SoundsControl } = require('sounds-control'); if (new SoundsControl().getState('x') !== 'unloaded') throw Error('CJS');",
    ],
    { cwd: directory }
  );
  writeFileSync(
    join(directory, 'consumer.ts'),
    "import { SoundsControl, type SoundAsset } from 'sounds-control'; const assets: SoundAsset[] = [{id:'x',url:'/x.wav'}]; const sounds = new SoundsControl(); void sounds.loadSounds(assets); void sounds.resumeAll();"
  );
  execFileSync(
    process.execPath,
    [
      resolve('node_modules/typescript/bin/tsc'),
      '--noEmit',
      '--strict',
      '--skipLibCheck',
      '--module',
      'NodeNext',
      '--moduleResolution',
      'NodeNext',
      '--target',
      'ES2022',
      join(directory, 'consumer.ts'),
    ],
    { cwd: directory, stdio: 'pipe' }
  );
  const sandbox = {};
  runInNewContext(readFileSync('dist/index.umd.cjs', 'utf8'), sandbox);
  assert.equal(typeof sandbox.SoundsControl.SoundsControl, 'function');
  console.log(
    'Published tarball: ESM, CommonJS, UMD, TypeScript, multilingual docs and file allowlist passed.'
  );
} finally {
  rmSync(directory, { recursive: true, force: true });
}
