import { DeadCodeFinding } from '../types';

export function getQuickFixTitle(finding: DeadCodeFinding): string {
  if (finding.type === 'unused-variable') return 'Remove unused variable';
  if (finding.type === 'unused-function') return 'Remove unused function';
  if (finding.type === 'unused-import') return 'Remove unused import';
  if (finding.type === 'unused-class') return 'Remove unused class';
  if (finding.type === 'unreachable-code') return 'Remove unreachable code';
  return 'Remove dead code';
}

export function isSafeAutoFix(finding: DeadCodeFinding, lineText?: string): boolean {
  if (!finding.removable) {
    return false;
  }

  if (finding.confidence < 85) {
    return false;
  }

  if (finding.type === 'unused-variable' && finding.startLine === finding.endLine && lineText && lineText.includes(',')) {
    return false;
  }

  return true;
}
