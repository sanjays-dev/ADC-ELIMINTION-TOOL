export type DeadCodeKind =
  | 'unused-function'
  | 'unused-variable'
  | 'unused-import'
  | 'unreachable-code'
  | 'unused-class';

export interface DeadCodeFinding {
  id: string;
  type: DeadCodeKind;
  name: string;
  message: string;
  filePath: string;
  startLine: number;
  startColumn: number;
  endLine: number;
  endColumn: number;
  confidence: number;
  removable: boolean;
  reason: string;
}

export interface AnalysisIssue {
  filePath: string;
  message: string;
}

export interface AnalyzeResult {
  findings: DeadCodeFinding[];
  issues: AnalysisIssue[];
  analyzedFiles: number;
}
