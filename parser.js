/**
 * Parser module
 */

const babelParser = require('@babel/parser');
const path = require('path');
const { readFile, buildLineIndex } = require('./fileUtils');

function detectLanguage(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  if (ext === '.ts' || ext === '.tsx') return 'typescript';
  if (ext === '.js' || ext === '.jsx') return 'javascript';
  if (ext === '.py') return 'python';
  if (ext === '.java') return 'java';
  if (ext === '.c') return 'c';
  if (ext === '.cc' || ext === '.cpp' || ext === '.cxx' || ext === '.h' || ext === '.hpp') return 'cpp';
  return 'unknown';
}

function parseFile(filePath) {
  const language = detectLanguage(filePath);
  const content = readFile(filePath);

  if (content === '') {
    return {
      filePath,
      language,
      ast: createEmptyAst(language),
      content: '',
      lineIndex: [0],
      error: null,
    };
  }

  try {
    if (language === 'python') return parsePython(filePath, content);
    if (language === 'java') return parseJava(filePath, content);
    if (language === 'c' || language === 'cpp') return parseCOrCpp(filePath, content, language);

    const isTypeScript = language === 'typescript';
    const ast = babelParser.parse(content, {
      sourceType: 'unambiguous',
      allowImportExportEverywhere: true,
      allowReturnOutsideFunction: true,
      plugins: [
        isTypeScript && 'typescript',
        'jsx',
        ['decorators', { decoratorsBeforeExport: false }],
        'classProperties',
        'classPrivateProperties',
        'classPrivateMethods',
        'dynamicImport',
        'optionalChaining',
        'nullishCoalescingOperator',
        'topLevelAwait',
      ].filter(Boolean),
    });

    return {
      filePath,
      language,
      ast,
      content,
      lineIndex: buildLineIndex(content),
      error: null,
    };
  } catch (error) {
    return {
      filePath,
      language,
      ast: null,
      content,
      lineIndex: buildLineIndex(content),
      error: `Parse error: ${String(error.message || error).split('\n')[0]}`,
    };
  }
}

function createEmptyAst(language) {
  if (language === 'python') return { type: 'Module', body: [] };
  if (language === 'java') return { type: 'CompilationUnit', body: [] };
  if (language === 'c' || language === 'cpp') return { type: 'TranslationUnit', body: [] };
  return { type: 'Program', body: [] };
}

function getIndentWidth(line) {
  const prefix = (line.match(/^[ \t]*/) || [''])[0];
  let width = 0;
  for (const ch of prefix) width += ch === '\t' ? 4 : 1;
  return width;
}

function isBlankOrComment(line) {
  const trimmed = String(line || '').trim();
  return trimmed === '' || trimmed.startsWith('#');
}

function isControlFlowTerminator(line) {
  return /^\s*(return|raise|break|continue)\b/.test(line);
}

function collectPythonUnreachableStatements(lines) {
  const unreachable = [];

  for (let i = 0; i < lines.length; i += 1) {
    const fnMatch = lines[i].match(/^([ \t]*)(?:async\s+)?def\s+[A-Za-z_][A-Za-z0-9_]*\s*\(/);
    if (!fnMatch) continue;

    const fnIndent = getIndentWidth(fnMatch[1]);
    const terminatedIndents = new Set();
    let j = i + 1;

    while (j < lines.length) {
      const line = lines[j];
      if (isBlankOrComment(line)) {
        j += 1;
        continue;
      }

      const indent = getIndentWidth(line);
      if (indent <= fnIndent) break;

      for (const level of Array.from(terminatedIndents)) {
        if (level > indent) terminatedIndents.delete(level);
      }

      let isUnreachable = false;
      for (const level of terminatedIndents) {
        if (level <= indent) {
          isUnreachable = true;
          break;
        }
      }

      if (isUnreachable) {
        unreachable.push({
          type: 'UnreachableStatement',
          name: `unreachable:${j + 1}`,
          lineno: j + 1,
          startLine: j + 1,
          endLine: j + 1,
        });
      }

      if (isControlFlowTerminator(line)) {
        terminatedIndents.add(indent);
      }

      j += 1;
    }

    i = j - 1;
  }

  return unreachable;
}

function parsePython(filePath, content) {
  const ast = { type: 'Module', body: [] };
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    let m = line.match(/^\s*def\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/);
    if (m) ast.body.push({ type: 'FunctionDef', name: m[1], lineno: i + 1 });
    m = line.match(/^\s*class\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (m) ast.body.push({ type: 'ClassDef', name: m[1], lineno: i + 1 });
    m = line.match(/^\s*from\s+([A-Za-z0-9_\.]+)\s+import\s+(.+)/);
    if (m) ast.body.push({ type: 'Import', names: m[2].split(',').map(s => s.trim()), lineno: i + 1 });
    m = line.match(/^\s*import\s+(.+)/);
    if (m) ast.body.push({ type: 'Import', names: m[1].split(',').map(s => s.trim()), lineno: i + 1 });
    m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (m) ast.body.push({ type: 'Assign', name: m[1], lineno: i + 1 });
  }

  for (const stmt of collectPythonUnreachableStatements(lines)) {
    ast.body.push(stmt);
  }

  return {
    filePath,
    language: 'python',
    ast,
    content,
    lineIndex: buildLineIndex(content),
    error: null,
  };
}

function parseJava(filePath, content) {
  const ast = { type: 'CompilationUnit', body: [] };
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    let m = line.match(/^\s*import\s+([A-Za-z0-9_\.]+)\s*;/);
    if (m) ast.body.push({ type: 'ImportDeclaration', name: m[1], lineno: i + 1 });
    m = line.match(/^\s*(?:public|private|protected)?\s*(?:abstract\s+|final\s+)?class\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (m) ast.body.push({ type: 'ClassDeclaration', name: m[1], lineno: i + 1 });
    m = line.match(
      /^\s*(?:public|private|protected)?\s*(?:static\s+)?(?:final\s+)?[A-Za-z0-9_<>\[\]]+\s+([A-Za-z_][A-Za-z0-9_]*)\s*\(/
    );
    if (m && !['if', 'for', 'while', 'switch', 'catch'].includes(m[1])) {
      ast.body.push({ type: 'MethodDeclaration', name: m[1], lineno: i + 1 });
    }
  }

  return {
    filePath,
    language: 'java',
    ast,
    content,
    lineIndex: buildLineIndex(content),
    error: null,
  };
}

function parseCOrCpp(filePath, content, language) {
  const ast = { type: 'TranslationUnit', body: [] };
  const lines = content.split('\n');

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    let m = line.match(/^\s*#include\s+[<"]([^>"]+)[>"]/);
    if (m) ast.body.push({ type: 'IncludeDeclaration', name: m[1], lineno: i + 1 });
    m = line.match(/^\s*(?:class|struct)\s+([A-Za-z_][A-Za-z0-9_]*)/);
    if (m) ast.body.push({ type: 'ClassDeclaration', name: m[1], lineno: i + 1 });
    m = line.match(/^\s*[A-Za-z_][A-Za-z0-9_:\*\s<>]*\s+([A-Za-z_][A-Za-z0-9_]*)\s*\([^;]*\)\s*\{/);
    if (m && !['if', 'for', 'while', 'switch'].includes(m[1])) {
      ast.body.push({ type: 'FunctionDeclaration', name: m[1], lineno: i + 1 });
    }
  }

  return {
    filePath,
    language,
    ast,
    content,
    lineIndex: buildLineIndex(content),
    error: null,
  };
}

function parseFiles(filePaths) {
  const results = new Map();
  for (const filePath of filePaths) {
    results.set(filePath, parseFile(filePath));
  }
  return results;
}

module.exports = {
  detectLanguage,
  parseFile,
  parseFiles,
};
