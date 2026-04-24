/**
 * Code Impact Analyzer
 *
 * Enriches dead-code candidates with dependency/risk metadata so users can see
 * what may break before removal.
 */

const path = require('path');
const { getAllFiles, normalizeFilePath, getRelativePath, readFile } = require('./fileUtils');

const SOURCE_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx', '.py', '.java', '.c', '.cc', '.cpp', '.cxx', '.h', '.hpp'];

function enrichWithImpact(items, options = {}) {
  const projectPath = options.projectPath ? path.resolve(options.projectPath) : process.cwd();
  const entryPoints = Array.isArray(options.entryPoints) ? options.entryPoints : [];

  const sourceFiles = getAllFiles(projectPath, SOURCE_EXTENSIONS);
  const fileCache = new Map();
  for (const filePath of sourceFiles) {
    fileCache.set(normalizeFilePath(path.resolve(filePath)), readFile(filePath));
  }

  const entrySet = new Set(entryPoints.map(p => normalizeFilePath(path.resolve(p))));

  return (items || []).map(item => ({
    ...item,
    impact: analyzeItemImpact(item, {
      projectPath,
      fileCache,
      entrySet,
    }),
  }));
}

function analyzeItemImpact(item, context) {
  if (!item || !item.name || item.name === 'anonymous') {
    return buildImpact('Low', [], 'No direct static dependents detected.');
  }

  if (item.type !== 'function') {
    return buildImpact(
      item.confidenceScore >= 85 ? 'Low' : item.confidenceScore >= 65 ? 'Medium' : 'High',
      [],
      'This removal affects a non-function symbol; review nearby usages manually.'
    );
  }

  const dependencyRefs = findFunctionReferences(item, context.fileCache);
  const dependentFiles = Array.from(dependencyRefs.keys()).sort();
  const riskLevel = calculateRiskLevel(item, dependentFiles, context.entrySet);
  const potentialBreakage = buildBreakageMessage(item, dependentFiles, context.entrySet);

  return buildImpact(riskLevel, dependentFiles, potentialBreakage);
}

function buildImpact(riskLevel, dependentFiles, potentialBreakage) {
  return {
    riskLevel,
    dependentFiles,
    dependencyCount: dependentFiles.length,
    potentialBreakage,
  };
}

function findFunctionReferences(item, fileCache) {
  const refs = new Map();
  const declarationFile = normalizeFilePath(path.resolve(item.filePath || ''));
  const declarationLine = item.location && item.location.line ? item.location.line : item.startLine || 1;
  const callPattern = new RegExp(`\\b${escapeRegExp(item.name)}\\s*\\(`, 'g');
  const symbolPattern = new RegExp(`\\b${escapeRegExp(item.name)}\\b`, 'g');

  for (const [normalizedFilePath, content] of fileCache.entries()) {
    if (!content) continue;
    const lines = String(content).split('\n');
    const matchedLines = [];
    for (let i = 0; i < lines.length; i += 1) {
      const lineNo = i + 1;
      const line = lines[i];
      callPattern.lastIndex = 0;
      symbolPattern.lastIndex = 0;
      if (!callPattern.test(line) && !symbolPattern.test(line)) continue;
      if (normalizedFilePath === declarationFile && lineNo === declarationLine) continue;
      matchedLines.push(lineNo);
    }
    if (matchedLines.length > 0) refs.set(normalizedFilePath, matchedLines);
  }

  return refs;
}

function calculateRiskLevel(item, dependentFiles, entrySet) {
  if (item.confidenceScore < 65) return 'High';
  if (dependentFiles.length === 0) return item.confidenceScore >= 85 ? 'Low' : 'Medium';

  for (const file of dependentFiles) {
    if (entrySet.has(file)) return 'High';
  }

  if (dependentFiles.length >= 2) return 'High';
  return 'Medium';
}

function buildBreakageMessage(item, dependentFiles, entrySet) {
  if (dependentFiles.length === 0) {
    return `No direct static callers of "${item.name}" were detected.`;
  }

  const entryDependents = dependentFiles.filter(file => entrySet.has(file));
  if (entryDependents.length > 0) {
    return `Entry-point callers reference "${item.name}"; removal can break runtime startup paths.`;
  }

  return `References to "${item.name}" exist in ${dependentFiles.length} file(s); removal can break those code paths.`;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function toRelativePath(projectPath, absolutePath) {
  const relative = getRelativePath(projectPath, absolutePath);
  return relative || absolutePath;
}

module.exports = {
  enrichWithImpact,
  toRelativePath,
};
