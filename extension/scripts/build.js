const esbuild = require('esbuild');
const path = require('path');

const isWatch = process.argv.includes('--watch');

const config = {
  entryPoints: [path.resolve(__dirname, '..', 'src', 'extension.ts')],
  bundle: true,
  platform: 'node',
  format: 'cjs',
  target: 'node18',
  outfile: path.resolve(__dirname, '..', 'out', 'extension.js'),
  sourcemap: true,
  external: ['vscode'],
  logLevel: 'info',
};

async function run() {
  if (isWatch) {
    const ctx = await esbuild.context(config);
    await ctx.watch();
    console.log('Watching extension sources...');
    return;
  }

  await esbuild.build(config);
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
