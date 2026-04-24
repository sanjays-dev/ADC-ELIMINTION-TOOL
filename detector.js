/**
 * Detector
 */

const { DEAD_CODE_TYPES } = require('./types');

function calculateConfidence(item) {
  if (item.type === 'import') return 95;
  if (item.type === 'variable') return 85;
  if (item.type === 'function') return item.isExported ? 35 : 90;
  if (item.type === 'class') return item.isExported ? 30 : 88;
  if (item.type === 'unreachable') return 100;
  return 80;
}

function classifyDeadCode(item) {
  if (item.type === 'import') return DEAD_CODE_TYPES.UNUSED_IMPORT;
  if (item.type === 'function') return DEAD_CODE_TYPES.UNUSED_FUNCTION;
  if (item.type === 'class') return DEAD_CODE_TYPES.UNUSED_CLASS;
  if (item.type === 'variable') return DEAD_CODE_TYPES.UNUSED_VARIABLE;
  return DEAD_CODE_TYPES.UNREACHABLE_CODE;
}

function detectDeadCode(analysisResult) {
  return (analysisResult.deadCodeItems || [])
    .map(item => ({
      ...item,
      classification: classifyDeadCode(item),
      confidenceScore: calculateConfidence(item),
    }))
    .sort((a, b) => b.confidenceScore - a.confidenceScore);
}

function filterByConfidence(deadCodeItems, minConfidence = 85) {
  return deadCodeItems.filter(item => item.confidenceScore >= minConfidence);
}

function groupByCategory(deadCodeItems) {
  const grouped = {};
  for (const item of deadCodeItems) {
    const category = item.classification || 'unknown';
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(item);
  }
  return grouped;
}

module.exports = {
  calculateConfidence,
  classifyDeadCode,
  detectDeadCode,
  filterByConfidence,
  groupByCategory,
};
