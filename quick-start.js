#!/usr/bin/env node
/**
 * Quick Setup and Test
 * Run this to set up and test the ADC Tool
 */


console.log('\n' + '═'.repeat(60));
console.log('🚀 ADC Tool Quick Start');
console.log('═'.repeat(60) + '\n');

// Step 1: Validate
console.log('Step 1: Validating installation...');
try {
  require('./validate.js');
} catch (error) {
  console.error('Validation failed:', error.message);
  process.exit(1);
}

// Step 2: Create demo files if they don't exist
console.log('\nStep 2: Setting up demo files...');
if (!fs.existsSync(path.join(demoDir, 'app.js'))) {
  console.log('Creating demo files...');
  require('./create-demo.js');
} else {
  console.log('✓ Demo files already exist');
}

console.log('\n' + '═'.repeat(60));
console.log('✅ Setup Complete!');
console.log('═'.repeat(60) + '\n');

console.log('You can now run:');
console.log('  npm run scan:here       # Scan current directory');
console.log('  npm run report:here     # Generate report');
console.log('  npm run clean:here      # Remove dead code (85% confidence)');
console.log('  npm run clean:all:here  # Remove all detected dead code\n');
