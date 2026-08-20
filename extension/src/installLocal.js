const cp = require('child_process');
const fs = require('fs');
const path = require('path');

function run(command, cwd) {
  cp.execSync(command, {
    cwd,
    stdio: 'inherit',
    shell: true,
  });
}

function findLatestVsix(extensionDir) {
  const files = fs
    .readdirSync(extensionDir)
    .filter((name) => name.endsWith('.vsix'))
    .map((name) => ({
      name,
      mtime: fs.statSync(path.join(extensionDir, name)).mtimeMs,
    }))
    .sort((a, b) => b.mtime - a.mtime);

  if (files.length === 0) {
    throw new Error('No VSIX file found in extension directory.');
  }

  return path.join(extensionDir, files[0].name);
}

function main() {
  const extensionDir = path.resolve(__dirname, '..');
  const projectRoot = path.resolve(extensionDir, '..');

  run('npm run package:local', extensionDir);
  const vsixPath = findLatestVsix(extensionDir);
  run(`code --install-extension "${vsixPath}" --force`, projectRoot);

  console.log(`Installed extension from: ${vsixPath}`);
}

main();
