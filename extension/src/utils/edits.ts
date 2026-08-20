import * as vscode from 'vscode';
import { DeadCodeFinding } from '../types';

export function buildRemovalRange(document: vscode.TextDocument, finding: DeadCodeFinding): vscode.Range {
  const startLine = Math.max(0, finding.startLine - 1);
  const endLine = Math.max(startLine, Math.min(document.lineCount - 1, finding.endLine - 1));
  const start = new vscode.Position(startLine, 0);
  const end = document.lineAt(endLine).rangeIncludingLineBreak.end;
  return new vscode.Range(start, end);
}

export function canApplySafeRemoval(document: vscode.TextDocument, finding: DeadCodeFinding): boolean {
  if (!finding.removable) {
    return false;
  }

  if (finding.startLine < 1 || finding.endLine < finding.startLine || finding.endLine > document.lineCount) {
    return false;
  }

  if (finding.type === 'unused-variable' && finding.startLine === finding.endLine) {
    const line = document.lineAt(finding.startLine - 1).text;
    if (line.includes(',')) {
      return false;
    }
  }

  return true;
}
