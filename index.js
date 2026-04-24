/**
 * Main entry point - JavaScript version
 */

// Export all modules
module.exports = {
  // File utilities
  ...require('./fileUtils'),

  // AST utilities
  ...require('./astUtils'),

  // Parser
  ...require('./parser'),

  // Graph builder
  ...require('./graphBuilder'),

  // Analyzer
  ...require('./analyzer'),

  // Detector
  ...require('./detector'),

  // Reporter
  ...require('./reporter'),

  // Cleaner
  ...require('./cleaner'),

  // Engine
  ...require('./engine'),

  // Types/Constants
  ...require('./types'),
};

console.log('✓ ADC Tool loaded successfully');
