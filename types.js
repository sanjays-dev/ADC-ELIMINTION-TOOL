/**
 * Type constants
 */

const DEAD_CODE_TYPES = {
  UNUSED_FUNCTION: 'unused-function',
  UNUSED_VARIABLE: 'unused-variable',
  UNUSED_IMPORT: 'unused-import',
  UNREACHABLE_CODE: 'unreachable-code',
  UNUSED_CLASS: 'unused-class',
};

const LANGUAGES = {
  JAVASCRIPT: 'javascript',
  TYPESCRIPT: 'typescript',
  PYTHON: 'python',
  JAVA: 'java',
  C: 'c',
  CPP: 'cpp',
  UNKNOWN: 'unknown',
};

const CONFIDENCE_LEVELS = {
  HIGH: 85,
  MEDIUM: 65,
  LOW: 40,
};

module.exports = {
  DEAD_CODE_TYPES,
  LANGUAGES,
  CONFIDENCE_LEVELS,
};

