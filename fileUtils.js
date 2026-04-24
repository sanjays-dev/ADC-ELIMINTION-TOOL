/**
 * File utilities
 */

const fs = require('fs');
const path = require('path');

function getAllFiles(
  dir,
  extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.c', '.cc', '.cpp', '.cxx', '.h', '.hpp']
) {
  const files = [];

  function walk(dirPath) {
    let entries = [];
    try {
      entries = fs.readdirSync(dirPath, { withFileTypes: true });
    } catch {
      return;
    }

    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name);
      if (entry.isDirectory()) {
        if (
          entry.name.startsWith('.') ||
          entry.name === 'node_modules' ||
          entry.name === 'dist' ||
          entry.name === 'build' ||
          entry.name === 'coverage'
        ) {
          continue;
        }
        walk(fullPath);
      } else if (entry.isFile() && extensions.some(ext => fullPath.endsWith(ext))) {
        files.push(fullPath);
      }
    }
  }

  walk(dir);
  return files;
}

function getProjectSizeBytes(
  dir,
  extensions = ['.ts', '.js', '.tsx', '.jsx', '.py', '.java', '.c', '.cc', '.cpp', '.cxx', '.h', '.hpp']
) {
  const files = getAllFiles(dir, extensions);
  let totalBytes = 0;
  for (const filePath of files) {
    try {
      totalBytes += fs.statSync(filePath).size;
    } catch {
      // Ignore files that cannot be read/statted.
    }
  }
  return totalBytes;
}

function readFile(filePath) {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return '';
  }
}

function writeFile(filePath, content) {
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, content, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

function removeFile(filePath) {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      return true;
    }
    return false;
  } catch {
    return false;
  }
}

function getFileStats(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    return { lines: content.split('\n').length, chars: content.length };
  } catch {
    return { lines: 0, chars: 0 };
  }
}

function normalizeFilePath(filePath) {
  return path.normalize(filePath).replace(/\\/g, '/');
}

function getRelativePath(basePath, filePath) {
  return path.relative(basePath, filePath).replace(/\\/g, '/');
}

function createId(filePath, name, line) {
  return `${normalizeFilePath(filePath)}:${name}:${line}`;
}

function extractLineContent(filePath, lineNum) {
  try {
    const lines = fs.readFileSync(filePath, 'utf-8').split('\n');
    return lines[lineNum - 1] || '';
  } catch {
    return '';
  }
}

function buildLineIndex(content) {
  const lineStarts = [0];
  for (let i = 0; i < content.length; i += 1) {
    if (content[i] === '\n') lineStarts.push(i + 1);
  }
  return lineStarts;
}

function getLineColumnFromIndex(lineIndex, index) {
  if (!Array.isArray(lineIndex) || lineIndex.length === 0) return { line: 0, column: 0 };

  let low = 0;
  let high = lineIndex.length - 1;
  while (low <= high) {
    const mid = Math.floor((low + high) / 2);
    if (lineIndex[mid] <= index) low = mid + 1;
    else high = mid - 1;
  }

  const line = Math.max(1, high + 1);
  const lineStart = lineIndex[Math.max(high, 0)];
  return { line, column: Math.max(0, index - lineStart) };
}

module.exports = {
  getAllFiles,
  getProjectSizeBytes,
  readFile,
  writeFile,
  removeFile,
  getFileStats,
  normalizeFilePath,
  getRelativePath,
  createId,
  extractLineContent,
  buildLineIndex,
  getLineColumnFromIndex,
};
