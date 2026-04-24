#!/usr/bin/env node
/**
 * Comprehensive test suite for ADC Tool
 */



function test(name, fn) {
  tests.push({ name, fn });
}

function run() {
  console.log('\n' + '═'.repeat(70));
  console.log('🧪 ADC TOOL - COMPREHENSIVE TEST SUITE');
  console.log('═'.repeat(70) + '\n');

    try {
      fn();
      console.log(`✅ ${name}`);
      passed++;
    } catch (error) {
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
      failed++;
    }
  }

  console.log('\n' + '═'.repeat(70));
  console.log(`Results: ${passed} passed, ${failed} failed`);
  console.log('═'.repeat(70) + '\n');

  process.exit(failed > 0 ? 1 : 0);
}

// Test 1: Import all modules
test('Import AnalysisEngine', () => {
  if (typeof AnalysisEngine !== 'function') throw new Error('AnalysisEngine is not a class');
});

test('Import CodeCleaner', () => {
  if (typeof CodeCleaner !== 'function') throw new Error('CodeCleaner is not a class');
});

test('Import parser functions', () => {
  if (typeof parseFile !== 'function') throw new Error('parseFile not a function');
  if (typeof parseFiles !== 'function') throw new Error('parseFiles not a function');
  if (typeof detectLanguage !== 'function') throw new Error('detectLanguage not a function');
});

test('Import fileUtils functions', () => {
  if (typeof getAllFiles !== 'function') throw new Error('getAllFiles not a function');
  if (typeof readFile !== 'function') throw new Error('readFile not a function');
  if (typeof writeFile !== 'function') throw new Error('writeFile not a function');
});

test('Import analyzer functions', () => {
  if (typeof analyzeCode !== 'function') throw new Error('analyzeCode not a function');
  if (typeof findReachableNodes !== 'function') throw new Error('findReachableNodes not a function');
});

test('Import detector functions', () => {
  if (typeof detectDeadCode !== 'function') throw new Error('detectDeadCode not a function');
  if (typeof filterByConfidence !== 'function') throw new Error('filterByConfidence not a function');
});

test('Import reporter functions', () => {
  if (typeof generateReport !== 'function') throw new Error('generateReport not a function');
  if (typeof saveReport !== 'function') throw new Error('saveReport not a function');
});

// Test 2: Instantiation
test('Instantiate AnalysisEngine', () => {
  if (!engine) throw new Error('Failed to create engine instance');
});

test('Instantiate CodeCleaner', () => {
  if (!cleaner) throw new Error('Failed to create cleaner instance');
});

// Test 3: Language detection
test('Detect JavaScript language', () => {
  if (detectLanguage('test.js') !== 'javascript') throw new Error('JS detection failed');
});

test('Detect TypeScript language', () => {
  if (detectLanguage('test.ts') !== 'typescript') throw new Error('TS detection failed');
});

test('Detect Python language', () => {
  if (detectLanguage('test.py') !== 'python') throw new Error('Python detection failed');
});

test('Detect Java language', () => {
  if (detectLanguage('test.java') !== 'java') throw new Error('Java detection failed');
});

// Test 4: File utilities
test('getAllFiles from existing directory', () => {
  if (!Array.isArray(files)) throw new Error('getAllFiles did not return array');
  if (files.length === 0) throw new Error('No files found in directory');
});

test('readFile function', () => {
  if (typeof content !== 'string') throw new Error('readFile did not return string');
  if (content.length === 0) throw new Error('Content is empty');
});

// Test 5: Parser
test('Parse simple JavaScript code', () => {
  
  // Create temp file
  fs.writeFileSync(tmpFile, testCode);
  
  try {
    if (result.error) throw new Error(`Parse error: ${result.error}`);
    if (!result.ast) throw new Error('AST not generated');
  } finally {
    if (fs.existsSync(tmpFile)) fs.unlinkSync(tmpFile);
  }
});

// Test 6: Confidence scoring
test('Calculate confidence score', () => {
  if (typeof score !== 'number' || score < 0 || score > 100) {
    throw new Error('Invalid confidence score');
  }
});

test('Filter by confidence', () => {
    { id: '1', confidenceScore: 95 },
    { id: '2', confidenceScore: 50 },
    { id: '3', confidenceScore: 80 },
  ];
  if (filtered.length !== 1) throw new Error('Filtering by confidence failed');
  if (filtered[0].id !== '1') throw new Error('Wrong item filtered');
});

// Test 7: Types/Constants
test('DEAD_CODE_TYPES defined', () => {
  if (!DEAD_CODE_TYPES.UNUSED_FUNCTION) throw new Error('Missing UNUSED_FUNCTION');
  if (!DEAD_CODE_TYPES.UNUSED_VARIABLE) throw new Error('Missing UNUSED_VARIABLE');
});

test('LANGUAGES defined', () => {
  if (LANGUAGES.JAVASCRIPT !== 'javascript') throw new Error('Wrong JAVASCRIPT value');
  if (LANGUAGES.TYPESCRIPT !== 'typescript') throw new Error('Wrong TYPESCRIPT value');
});

// Run all tests
run();
