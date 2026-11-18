import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
const root = new URL('../', import.meta.url);
for (const site of ['main', 'blog', 'tibi']) {
  await build({ entryPoints: [fileURLToPath(new URL('src/analytics.js', root))], bundle: true, minify: true, format: 'iife', target: 'es2022', legalComments: 'eof', outfile: fileURLToPath(new URL(`../${site}/public/assets/analytics.js`, root)) });
}
