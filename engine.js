/**
 * Analysis Engine
 */

const path = require('path');
const chalk = require('chalk');
const { getAllFiles, getFileStats, normalizeFilePath } = require('./fileUtils');
const { parseFiles, detectLanguage } = require('./parser');
const { analyzeCode } = require('./analyzer');
const { detectDeadCode, filterByConfidence } = require('./detector');
const { generateReport, saveReport } = require('./reporter');

class AnalysisEngine {
  async analyze(options = {}) {
    const projectPath = path.resolve(options.projectPath || '.');
    const minConfidence = typeof options.minConfidence === 'number' ? options.minConfidence : 0;

    console.log(`Scanning project: ${projectPath}\n`);

    const sourceFiles = getAllFiles(projectPath, [
      '.ts',
      '.tsx',
      '.js',
      '.jsx',
      '.py',
      '.java',
      '.c',
      '.cc',
      '.cpp',
      '.cxx',
      '.h',
      '.hpp',
    ]);

    console.log(`Found ${sourceFiles.length} source files\n`);
    if (sourceFiles.length === 0) {
      throw new Error(
        `No source files found in: ${projectPath}. Use an absolute path or run the command from the project root.`
      );
    }

    const languageStats = {};
    for (const file of sourceFiles) {
      const lang = detectLanguage(file);
      languageStats[lang] = (languageStats[lang] || 0) + 1;
    }

    console.log('Parsing files...');
    const parsedFiles = parseFiles(sourceFiles);
    let successCount = 0;
    const errors = [];
    for (const [filePath, parsed] of parsedFiles.entries()) {
      if (!parsed.error) successCount += 1;
      else errors.push(`${filePath}: ${parsed.error}`);
    }
    console.log(`Successfully parsed ${successCount}/${sourceFiles.length} files\n`);
    console.log(`Languages detected: ${formatLanguageStats(languageStats)}\n`);

    if (successCount === 0) {
      const sample = errors.slice(0, 3);
      throw new Error(
        'All files failed to parse. Verify dependencies and source files.\nSample errors:\n' + sample.join('\n')
      );
    }

    const entryPoints =
      options.entryPoints && options.entryPoints.length
        ? options.entryPoints.map(p => path.resolve(p))
        : this.findEntryPoints(sourceFiles, projectPath);

    const analysisResult = analyzeCode(parsedFiles, entryPoints);
    const allDeadCode = detectDeadCode(analysisResult);
    const deadCodeItems = filterByConfidence(allDeadCode, minConfidence);

    const totalProjectLines = sourceFiles.reduce((sum, file) => sum + getFileStats(file).lines, 0);
    const totalDeadLines = deadCodeItems.reduce((sum, item) => sum + (item.endLine - item.startLine + 1), 0);
    const codeReductionPercentage = totalProjectLines ? (totalDeadLines / totalProjectLines) * 100 : 0;

    return {
      projectPath,
      scanDate: new Date().toISOString(),
      totalFiles: sourceFiles.length,
      languageStats,
      totalNodes: analysisResult.totalNodes,
      deadCodeItems,
      totalDeadCodeLines: totalDeadLines,
      codeReductionPercentage,
      confidenceScore: deadCodeItems.length
        ? Math.round(deadCodeItems.reduce((s, d) => s + d.confidenceScore, 0) / deadCodeItems.length)
        : 100,
      summary: {
        totalDeadFunctions: deadCodeItems.filter(d => d.type === 'function').length,
        totalDeadVariables: deadCodeItems.filter(d => d.type === 'variable').length,
        totalUnusedImports: deadCodeItems.filter(d => d.type === 'import').length,
        totalUnreachableFiles: 0,
      },
      entryPoints: entryPoints.map(p => normalizeFilePath(p)),
      analysis: analysisResult,
    };
  }

  findEntryPoints(allFiles, projectPath) {
    const entryNames = new Set([
      'index.js',
      'index.ts',
      'app.js',
      'app.ts',
      'main.js',
      'main.ts',
      'app.py',
      '__main__.py',
      'Main.java',
      'App.java',
      'main.c',
      'main.cpp',
    ]);

    const found = allFiles.filter(f => entryNames.has(path.basename(f)));
    if (found.length > 0) return found;
    return allFiles.filter(f => path.dirname(f) === projectPath);
  }

  generateReport(report, format = 'console') {
    return generateReport(report.analysis, report.deadCodeItems, format);
  }

  saveReport(report, filePath, format = 'json') {
    return saveReport(report, filePath, format);
  }
}

function formatLanguageStats(languageStats) {
  const labels = {
    javascript: 'JavaScript',
    typescript: 'TypeScript',
    python: 'Python',
    java: 'Java',
    c: 'C',
    cpp: 'C++',
    unknown: 'Unknown',
  };
  return Object.entries(languageStats)
    .sort((a, b) => b[1] - a[1])
    .map(([k, v]) => `${labels[k] || k} (${v})`)
    .join(', ');
}

module.exports = {
  AnalysisEngine,
};

