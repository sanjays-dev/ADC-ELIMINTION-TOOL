/**
 * Reporter
 */

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const { groupByCategory } = require('./detector');
const { getDeadCodeStatus } = require('./confidenceStatus');

function generateJsonReport(analysisResult, deadCodeItems) {
  const totalNodes = analysisResult.totalNodes || 0;
  const reachable = analysisResult.reachableCount || 0;
  return {
    timestamp: new Date().toISOString(),
    summary: {
      totalNodes,
      reachableNodes: reachable,
      deadCodeItems: deadCodeItems.length,
      coverage: totalNodes ? `${((reachable / totalNodes) * 100).toFixed(2)}%` : '0.00%',
    },
    deadCode: deadCodeItems,
    byCategory: groupByCategory(deadCodeItems),
  };
}

function generateConsoleReport(analysisResult, deadCodeItems) {
  const totalNodes = analysisResult.totalNodes || 0;
  const reachable = analysisResult.reachableCount || 0;
  const coverage = totalNodes ? ((reachable / totalNodes) * 100).toFixed(2) : '0.00';

  let output = '';
  output += chalk.bold.cyan('Analysis Results\n');
  output += chalk.gray('='.repeat(60)) + '\n\n';
  output += `Total Nodes: ${chalk.cyan(totalNodes)}\n`;
  output += `Reachable: ${chalk.green(reachable)}\n`;
  output += `Dead Code Items: ${chalk.red(deadCodeItems.length)}\n`;
  output += `Coverage: ${chalk.yellow(coverage)}%\n\n`;

  if (deadCodeItems.length === 0) {
    output += chalk.green('No dead code detected.\n');
    return output;
  }

  const grouped = groupByCategory(deadCodeItems);
  output += chalk.bold('Dead Code:\n');
  for (const [category, items] of Object.entries(grouped)) {
    output += `\n${chalk.yellow(category)} (${items.length})\n`;
    for (const item of items) {
      output += `  - ${item.name} at ${item.filePath}:${item.location.line} (${item.confidenceScore}%)\n`;
      output += `    Status: ${getDeadCodeStatus(item.confidenceScore).text}\n`;
      if (item.explanation) {
        output += `    Why: ${item.explanation}\n`;
      }
    }
  }
  return output;
}

function saveReport(report, filePath, format = 'json') {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    const content = format === 'json' ? JSON.stringify(report, null, 2) : String(report);
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function generateReport(analysisResult, deadCodeItems, format = 'console') {
  if (format === 'json') return generateJsonReport(analysisResult, deadCodeItems);
  return generateConsoleReport(analysisResult, deadCodeItems);
}

module.exports = {
  generateJsonReport,
  generateConsoleReport,
  generateReport,
  saveReport,
};
