#!/usr/bin/env node
/**
 * Create JavaScript demo project with unused dead code
 */

const fs = require('fs');
const path = require('path');

const jsDir = path.resolve(process.cwd(), 'demo-unused-js');

if (!fs.existsSync(jsDir)) {
  fs.mkdirSync(jsDir, { recursive: true });
}

console.log('🟨 Creating JavaScript demo with unused dead code...\n');

fs.writeFileSync(
  path.join(jsDir, 'app.js'),
  `function used() {
  return 1;
}

function deadAgain() {
  return 42;
}

used();
`
);

fs.writeFileSync(
  path.join(jsDir, 'unused.js'),
  `// Entire file unused
function legacy() {
  return 'legacy';
}
`
);

console.log('✅ JavaScript demo created with unused dead code!\n');
console.log('Files created:');
console.log('  - app.js (entry point)');
console.log('  - unused.js (all unused)\n');
console.log('Test it:');
console.log('  node cli.js scan ./demo-unused-js --verbose\n');
