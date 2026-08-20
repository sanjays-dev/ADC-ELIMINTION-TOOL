import * as fs from 'fs';
import * as path from 'path';
import * as babelParser from '@babel/parser';
import { AnalyzeResult, DeadCodeFinding, DeadCodeKind } from '../types';

const parserCore = require('../../../parser');
const analyzerCore = require('../../../analyzer');
const detectorCore = require('../../../detector');
const fileUtilsCore = require('../../../fileUtils');

const SUPPORTED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx'];
const SUPPORTED_LANGUAGES = new Set(['javascript', 'typescript']);
const ENTRY_NAMES = new Set(['index.js', 'index.ts', 'main.js', 'main.ts', 'app.js', 'app.ts']);

function isSupportedFile(filePath: string): boolean {
  return SUPPORTED_EXTENSIONS.includes(path.extname(filePath).toLowerCase());
}

function normalizeFile(filePath: string): string {
  return String(fileUtilsCore.normalizeFilePath(path.resolve(filePath)));
}

function createInMemoryParsed(filePath: string, source: string) {
  const language = filePath.endsWith('.ts') || filePath.endsWith('.tsx') ? 'typescript' : 'javascript';

  const ast = babelParser.parse(source, {
    sourceType: 'unambiguous',
    allowImportExportEverywhere: true,
    allowReturnOutsideFunction: true,
    plugins: [
      language === 'typescript' ? 'typescript' : null,
      'jsx',
      ['decorators', { decoratorsBeforeExport: false }],
      'classProperties',
      'classPrivateProperties',
      'classPrivateMethods',
      'dynamicImport',
      'optionalChaining',
      'nullishCoalescingOperator',
      'topLevelAwait'
    ].filter(Boolean) as any,
  });

  return {
    filePath,
    language,
    ast,
    content: source,
    lineIndex: fileUtilsCore.buildLineIndex(source),
    error: null,
  };
}

function collectUnreachableFromAst(filePath: string, ast: any): DeadCodeFinding[] {
  const findings: DeadCodeFinding[] = [];

  function visit(node: any): void {
    if (!node || typeof node !== 'object') {
      return;
    }

    if (Array.isArray(node.body)) {
      let terminated = false;
      for (const stmt of node.body) {
        if (!stmt || typeof stmt !== 'object') {
          continue;
        }

        if (terminated) {
          const startLine = stmt.loc?.start?.line ?? 1;
          const endLine = stmt.loc?.end?.line ?? startLine;
          const startColumn = stmt.loc?.start?.column ?? 0;
          const endColumn = stmt.loc?.end?.column ?? 0;
          findings.push({
            id: `${normalizeFile(filePath)}:${startLine}:${endLine}:unreachable-code`,
            type: 'unreachable-code',
            name: 'unreachable statement',
            message: 'Unreachable code detected',
            filePath: normalizeFile(filePath),
            startLine,
            startColumn,
            endLine,
            endColumn,
            confidence: 100,
            removable: true,
            reason: 'Statement appears after a terminating control-flow statement',
          });
        }

        if (stmt.type === 'ReturnStatement' || stmt.type === 'ThrowStatement' || stmt.type === 'ContinueStatement' || stmt.type === 'BreakStatement') {
          terminated = true;
        }

        visit(stmt);
      }
      return;
    }

    for (const value of Object.values(node)) {
      if (!value || typeof value !== 'object') {
        continue;
      }
      if (Array.isArray(value)) {
        for (const item of value) {
          visit(item);
        }
      } else {
        visit(value);
      }
    }
  }

  visit(ast?.program ?? ast);
  return findings;
}

function isRemovable(item: any, content?: string): boolean {
  if (!item || item.confidenceScore < 85) {
    return false;
  }

  const type = String(item.classification || '');
  if (!['unused-function', 'unused-variable', 'unused-import', 'unreachable-code', 'unused-class'].includes(type)) {
    return false;
  }

  if (!content) {
    return true;
  }

  if (type === 'unused-variable' && item.startLine === item.endLine) {
    const lines = content.split(/\r?\n/);
    const line = lines[item.startLine - 1] || '';
    if (line.includes(',')) {
      return false;
    }
  }

  return true;
}

function toFinding(item: any, contentByFile: Map<string, string>): DeadCodeFinding {
  const normalized = normalizeFile(item.filePath);
  const startLine = Math.max(1, Number(item.startLine || item.location?.line || 1));
  const endLine = Math.max(startLine, Number(item.endLine || startLine));
  const startColumn = Math.max(0, Number(item.location?.column || 0));

  const content = contentByFile.get(normalized) || '';
  const lines = content.split(/\r?\n/);
  const endLineText = lines[Math.max(0, endLine - 1)] || '';
  const endColumn = Math.max(startColumn + 1, endLineText.length);

  const type = String(item.classification || 'unreachable-code') as DeadCodeKind;

  return {
    id: `${normalized}:${startLine}:${endLine}:${type}:${String(item.name || '')}`,
    type,
    name: String(item.name || 'anonymous'),
    message: buildMessage(type, String(item.name || 'anonymous')),
    filePath: normalized,
    startLine,
    startColumn,
    endLine,
    endColumn,
    confidence: Number(item.confidenceScore || 0),
    removable: isRemovable(item, content),
    reason: String(item.reason || 'Not reachable from entry points'),
  };
}

function buildMessage(type: DeadCodeKind, name: string): string {
  if (type === 'unused-function') return `Unused function detected: ${name}`;
  if (type === 'unused-variable') return `Unused variable detected: ${name}`;
  if (type === 'unused-import') return `Unused import detected: ${name}`;
  if (type === 'unused-class') return `Unused class detected: ${name}`;
  return 'Unreachable code detected';
}

function buildEntryPoints(filePaths: string[]): string[] {
  const matched = filePaths.filter((file) => ENTRY_NAMES.has(path.basename(file)));
  return matched.length > 0 ? matched : filePaths.slice(0, 4);
}

function getWorkspaceFiles(workspacePath: string): string[] {
  const files: string[] = fileUtilsCore.getAllFiles(workspacePath, SUPPORTED_EXTENSIONS);
  return files.filter((file) => isSupportedFile(file));
}

function parseFileSafely(filePath: string): any {
  const parsed = parserCore.parseFile(filePath);
  if (!parsed || !SUPPORTED_LANGUAGES.has(parsed.language)) {
    return {
      filePath,
      language: 'unknown',
      ast: null,
      content: '',
      lineIndex: [0],
      error: 'Unsupported language',
    };
  }
  return parsed;
}

export async function analyzeWorkspace(workspacePath: string, minConfidence: number): Promise<AnalyzeResult> {
  const filePaths = getWorkspaceFiles(workspacePath);
  const parsedFiles = new Map<string, any>();
  const contentByFile = new Map<string, string>();
  const issues: { filePath: string; message: string }[] = [];

  for (let i = 0; i < filePaths.length; i += 1) {
    const filePath = filePaths[i];
    const parsed = parseFileSafely(filePath);
    parsedFiles.set(filePath, parsed);
    contentByFile.set(normalizeFile(filePath), String(parsed.content || ''));
    if (parsed.error) {
      issues.push({ filePath: normalizeFile(filePath), message: parsed.error });
    }

    if (i % 30 === 0) {
      await new Promise((resolve) => setImmediate(resolve));
    }
  }

  const entryPoints = buildEntryPoints(filePaths);
  const analysis = analyzerCore.analyzeCode(parsedFiles, entryPoints);
  const detected = detectorCore.detectDeadCode(analysis).filter((item: any) => Number(item.confidenceScore || 0) >= minConfidence);

  const findings = detected
    .map((item: any) => toFinding(item, contentByFile))
    .filter((finding: DeadCodeFinding) => SUPPORTED_LANGUAGES.has(parserCore.detectLanguage(finding.filePath)));

  for (const [filePath, parsed] of parsedFiles.entries()) {
    if (!parsed || parsed.error || !parsed.ast) {
      continue;
    }
    findings.push(...collectUnreachableFromAst(filePath, parsed.ast));
  }

  return {
    findings,
    issues,
    analyzedFiles: filePaths.length,
  };
}

export async function analyzeCurrentFile(filePath: string, sourceText: string, minConfidence: number): Promise<AnalyzeResult> {
  if (!isSupportedFile(filePath)) {
    return { findings: [], issues: [], analyzedFiles: 0 };
  }

  const parsedFiles = new Map<string, any>();
  const contentByFile = new Map<string, string>();

  try {
    const parsed = createInMemoryParsed(filePath, sourceText);
    parsedFiles.set(filePath, parsed);
    contentByFile.set(normalizeFile(filePath), sourceText);

    const analysis = analyzerCore.analyzeCode(parsedFiles, [filePath]);
    const detected = detectorCore.detectDeadCode(analysis).filter((item: any) => Number(item.confidenceScore || 0) >= minConfidence);
    const findings = detected.map((item: any) => toFinding(item, contentByFile));
    findings.push(...collectUnreachableFromAst(filePath, parsed.ast));

    return { findings, issues: [], analyzedFiles: 1 };
  } catch (error: any) {
    return {
      findings: [],
      issues: [
        {
          filePath: normalizeFile(filePath),
          message: `Parse error: ${String(error?.message || error)}`,
        },
      ],
      analyzedFiles: 1,
    };
  }
}

export function createWorkspaceEditPlan(findings: DeadCodeFinding[], fileTextByPath: Map<string, string>): DeadCodeFinding[] {
  return findings.filter((finding) => {
    if (!finding.removable) {
      return false;
    }

    const fileText = fileTextByPath.get(normalizeFile(finding.filePath));
    if (!fileText) {
      return false;
    }

    const lines = fileText.split(/\r?\n/);
    if (finding.startLine < 1 || finding.endLine > lines.length || finding.endLine < finding.startLine) {
      return false;
    }

    if (finding.type === 'unused-variable' && finding.startLine === finding.endLine && lines[finding.startLine - 1].includes(',')) {
      return false;
    }

    return true;
  });
}
