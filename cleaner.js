/**
 * Cleaner
 */

const { readFile, writeFile } = require('./fileUtils');
const { getDeadCodeStatus } = require('./confidenceStatus');
const { toRelativePath } = require('./impactAnalyzer');

const MAX_PREVIEW_FILES = 5;
const MAX_PREVIEW_CODE_LINES = 120;
const MAX_PREVIEW_DIFF_ROWS = 220;

function collectDeclaredNames(content) {
  const names = new Set();
  const patterns = [
    /\bfunction\s+([A-Za-z_$][A-Za-z0-9_$]*)\s*\(/g,
    /\bclass\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g,
    /\b(?:const|let|var)\s+([A-Za-z_$][A-Za-z0-9_$]*)\b/g,
  ];
  for (const pattern of patterns) {
    let m;
    while ((m = pattern.exec(content)) !== null) names.add(m[1]);
  }
  return names;
}

function pruneCommonJsExports(content) {
  const declared = collectDeclaredNames(content);
  const exportPattern = /module\.exports\s*=\s*{([^}]*)}\s*;?/g;
  return content.replace(exportPattern, (_full, rawProps) => {
    const props = rawProps.split(',').map(s => s.trim()).filter(Boolean);
    const kept = [];
    for (const prop of props) {
      const alias = prop.match(/^([A-Za-z_$][A-Za-z0-9_$]*)\s*:\s*([A-Za-z_$][A-Za-z0-9_$]*)$/);
      if (alias) {
        if (declared.has(alias[2])) kept.push(prop);
      } else if (declared.has(prop)) {
        kept.push(prop);
      }
    }
    if (kept.length === 0) return '';
    return `module.exports = { ${kept.join(', ')} };`;
  });
}

function collectFileChanges(items) {
  const fileChanges = new Map();

  for (const item of items) {
    if (!fileChanges.has(item.filePath)) {
      fileChanges.set(item.filePath, { content: readFile(item.filePath), ranges: [] });
    }
    const startLine = Math.max(1, item.startLine || (item.location && item.location.line) || 1);
    const endLine = Math.max(startLine, item.endLine || startLine);
    fileChanges.get(item.filePath).ranges.push({ startLine, endLine });
  }

  return fileChanges;
}

function normalizeRanges(linesLength, ranges) {
  const removeSet = new Set();
  for (const range of ranges || []) {
    const start = Math.max(1, Math.min(linesLength, range.startLine));
    const end = Math.max(start, Math.min(linesLength, range.endLine));
    for (let i = start; i <= end; i += 1) removeSet.add(i);
  }
  return removeSet;
}

function applyRangesToContent(content, ranges) {
  const lines = String(content || '').split('\n');
  const removeSet = normalizeRanges(lines.length, ranges);
  let newContent = lines.filter((_, idx) => !removeSet.has(idx + 1)).join('\n');
  newContent = pruneCommonJsExports(newContent);
  return newContent;
}

function formatCodeWithLineNumbers(content, maxLines = MAX_PREVIEW_CODE_LINES) {
  const lines = String(content || '').split('\n');
  const visible = lines.slice(0, maxLines);
  const width = String(Math.max(visible.length, 1)).length;
  const numbered = visible.map((line, idx) => `${String(idx + 1).padStart(width, ' ')} | ${line}`);
  if (lines.length > maxLines) {
    numbered.push(`... (${lines.length - maxLines} more lines omitted)`);
  }
  return numbered.join('\n');
}

function padCell(value, width) {
  const raw = String(value || '');
  if (raw.length === width) return raw;
  if (raw.length < width) return raw + ' '.repeat(width - raw.length);
  if (width <= 1) return raw.slice(0, width);
  return raw.slice(0, width - 1) + '…';
}

function buildSideBySideDiff(originalContent, cleanedContent, maxRows = MAX_PREVIEW_DIFF_ROWS) {
  const original = String(originalContent || '').split('\n');
  const cleaned = String(cleanedContent || '').split('\n');
  const rows = [];
  let oi = 0;
  let ci = 0;
  const lookahead = 20;

  while ((oi < original.length || ci < cleaned.length) && rows.length < maxRows) {
    const left = oi < original.length ? original[oi] : null;
    const right = ci < cleaned.length ? cleaned[ci] : null;

    if (left !== null && right !== null && left === right) {
      rows.push({ mark: ' ', leftNum: oi + 1, left, rightNum: ci + 1, right });
      oi += 1;
      ci += 1;
      continue;
    }

    let nextCleanInOrig = -1;
    if (right !== null) {
      const maxLeft = Math.min(original.length, oi + lookahead + 1);
      for (let idx = oi + 1; idx < maxLeft; idx += 1) {
        if (original[idx] === right) {
          nextCleanInOrig = idx;
          break;
        }
      }
    }

    let nextOrigInClean = -1;
    if (left !== null) {
      const maxRight = Math.min(cleaned.length, ci + lookahead + 1);
      for (let idx = ci + 1; idx < maxRight; idx += 1) {
        if (cleaned[idx] === left) {
          nextOrigInClean = idx;
          break;
        }
      }
    }

    if (
      nextCleanInOrig !== -1 &&
      (nextOrigInClean === -1 || nextCleanInOrig - oi <= nextOrigInClean - ci)
    ) {
      while (oi < nextCleanInOrig && rows.length < maxRows) {
        rows.push({ mark: '-', leftNum: oi + 1, left: original[oi], rightNum: '', right: '' });
        oi += 1;
      }
      continue;
    }

    if (nextOrigInClean !== -1) {
      while (ci < nextOrigInClean && rows.length < maxRows) {
        rows.push({ mark: '+', leftNum: '', left: '', rightNum: ci + 1, right: cleaned[ci] });
        ci += 1;
      }
      continue;
    }

    if (left !== null || right !== null) {
      rows.push({
        mark: '~',
        leftNum: left !== null ? oi + 1 : '',
        left: left || '',
        rightNum: right !== null ? ci + 1 : '',
        right: right || '',
      });
      if (left !== null) oi += 1;
      if (right !== null) ci += 1;
    }
  }

  const leftHeader = 'ORIGINAL';
  const rightHeader = 'CLEANED';
  const leftWidth = 56;
  const rightWidth = 56;
  const header = `M | LN  ${padCell(leftHeader, leftWidth)} | LN  ${padCell(rightHeader, rightWidth)}`;
  const divider = '-'.repeat(header.length);
  const formatted = [header, divider];

  for (const row of rows) {
    const leftNum = String(row.leftNum || '').padStart(3, ' ');
    const rightNum = String(row.rightNum || '').padStart(3, ' ');
    formatted.push(
      `${row.mark} | ${leftNum} ${padCell(row.left, leftWidth)} | ${rightNum} ${padCell(row.right, rightWidth)}`
    );
  }

  if ((oi < original.length || ci < cleaned.length) && rows.length >= maxRows) {
    formatted.push(`... (${Math.max(original.length - oi, cleaned.length - ci)} more diff rows omitted)`);
  }

  return formatted.join('\n');
}

class CodeCleaner {
  generateDeletionProposal(deadCodeItems, options = {}) {
    const safeToDelete = deadCodeItems.filter(item => item.confidenceScore >= 85);
    const requiresReview = deadCodeItems.filter(item => item.confidenceScore < 85);
    return {
      timestamp: new Date().toISOString(),
      projectPath: options.projectPath || '',
      items: deadCodeItems,
      safeToDelete,
      requiresReview,
    };
  }

  previewChanges(proposal) {
    let output = '\nPROPOSED CHANGES\n';
    output += `Safe to Delete: ${proposal.safeToDelete.length} items\n`;
    output += `Requires Review: ${proposal.requiresReview.length} items\n\n`;
    for (const item of proposal.safeToDelete) {
      output += `- ${item.name} (${item.type}) at ${item.filePath}:${item.location.line}\n`;
      output += `  Status: ${getDeadCodeStatus(item.confidenceScore).text}\n`;
      if (item.type === 'function' && item.impact) {
        output += `  Risk Level: ${item.impact.riskLevel}\n`;
        const dependents = Array.isArray(item.impact.dependentFiles) ? item.impact.dependentFiles : [];
        if (dependents.length === 0) {
          output += '  Dependent Files: none\n';
        } else {
          const list = dependents
            .map(filePath =>
              proposal.projectPath
                ? toRelativePath(proposal.projectPath, filePath)
                : filePath
            )
            .join(', ');
          output += `  Dependent Files: ${list}\n`;
        }
        output += `  Breakage: ${item.impact.potentialBreakage}\n`;
      }
      if (item.explanation) {
        output += `  Why: ${item.explanation}\n`;
      }
    }
    return output;
  }

  buildLiveRefactoringPreview(proposal) {
    const safeItems = proposal && Array.isArray(proposal.safeToDelete) ? proposal.safeToDelete : [];
    if (safeItems.length === 0) {
      return '\nLIVE REFACTORING PREVIEW\nNo removable items to preview.\n';
    }

    const fileChanges = collectFileChanges(safeItems);
    const fileEntries = Array.from(fileChanges.entries());
    let output = '\nLIVE REFACTORING PREVIEW\n';
    output += `Files Affected: ${fileEntries.length}\n\n`;

    const visibleEntries = fileEntries.slice(0, MAX_PREVIEW_FILES);
    for (const [filePath, change] of visibleEntries) {
      const originalContent = String(change.content || '');
      const cleanedContent = applyRangesToContent(originalContent, change.ranges);
      const displayPath = proposal.projectPath ? toRelativePath(proposal.projectPath, filePath) : filePath;

      output += `File: ${displayPath}\n`;
      output += 'Original code:\n';
      output += `${formatCodeWithLineNumbers(originalContent)}\n\n`;
      output += 'Cleaned code:\n';
      output += `${formatCodeWithLineNumbers(cleanedContent)}\n\n`;
      output += 'Diff view (side-by-side):\n';
      output += `${buildSideBySideDiff(originalContent, cleanedContent)}\n\n`;
    }

    if (fileEntries.length > MAX_PREVIEW_FILES) {
      output += `... (${fileEntries.length - MAX_PREVIEW_FILES} more files omitted from live preview)\n`;
    }

    return output;
  }

  removeDeadCode(items) {
    let removed = 0;
    let failed = 0;
    const fileChanges = collectFileChanges(items);

    for (const [filePath, change] of fileChanges.entries()) {
      try {
        const newContent = applyRangesToContent(change.content, change.ranges);
        if (writeFile(filePath, newContent)) removed += change.ranges.length;
        else failed += change.ranges.length;
      } catch {
        failed += change.ranges.length;
      }
    }

    return { removed, failed };
  }
}

module.exports = {
  CodeCleaner,
};
