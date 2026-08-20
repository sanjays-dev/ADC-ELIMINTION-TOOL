import { DeadCodeFinding } from '../types';

export interface DiagnosticData {
  severity: 'warning';
  source: string;
  message: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  code: string;
}

export function findingToDiagnosticData(finding: DeadCodeFinding): DiagnosticData {
  return {
    severity: 'warning',
    source: 'Dead Code Eliminator',
    message: finding.message,
    startLine: finding.startLine,
    startColumn: finding.startColumn,
    endLine: finding.endLine,
    endColumn: finding.endColumn,
    code: finding.id,
  };
}
