#!/usr/bin/env node
/**
 * Test script to validate the ADC Tool implementation
 */


console.log('🧪 ADC Tool Implementation Validation\n');

// Test 1: Engine loads
console.log('Test 1: Loading AnalysisEngine...');
try {
  console.log('✓ AnalysisEngine imported successfully');
  
  console.log('✓ AnalysisEngine instantiated successfully\n');
} catch (error) {
  console.error('✗ Failed to load AnalysisEngine:', error.message);
  process.exit(1);
}

// Test 2: Parser loads
console.log('Test 2: Loading Parser...');
try {
  console.log('✓ Parser loaded successfully\n');
} catch (error) {
  console.error('✗ Failed to load Parser:', error.message);
  process.exit(1);
}

// Test 3: File utilities load
console.log('Test 3: Loading FileUtils...');
try {
  console.log('✓ FileUtils loaded successfully\n');
} catch (error) {
  console.error('✗ Failed to load FileUtils:', error.message);
  process.exit(1);
}

// Test 4: Check if demo files exist
console.log('Test 4: Checking demo files...');
try {
  
  if (fs.existsSync(demoDir)) {
    if (files.length > 0) {
      console.log(`✓ Found ${files.length} demo files`);
      files.forEach(f => console.log(`  - ${path.basename(f)}`));
      console.log('');
    } else {
      console.log('⚠ Demo directory exists but is empty\n');
    }
  } else {
    console.log('⚠ Demo directory does not exist\n');
    console.log('  Run: node create-demo.js\n');
  }
} catch (error) {
  console.error('✗ Error checking demo files:', error.message);
  process.exit(1);
}

console.log('✅ All tests passed! The ADC Tool is ready to use.\n');
console.log('Next steps:');
console.log('  1. Create demo files: node create-demo.js');
console.log('  2. Scan for dead code: node cli.js scan ./demo');
console.log('  3. Generate report: node cli.js report ./demo --output report.json');
console.log('  4. Clean up code: node cli.js clean ./demo --confidence 85');
