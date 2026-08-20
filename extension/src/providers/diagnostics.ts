import * as vscode from 'vscode';
import { DeadCodeFinding } from '../types';
import { findingToDiagnosticData } from './diagnosticModel';

const SOURCE = 'Dead Code Eliminator';

export function toDiagnostic(finding: DeadCodeFinding): vscode.Diagnostic {
  const mapped = findingToDiagnosticData(finding);
  const range = new vscode.Range(
    new vscode.Position(Math.max(0, mapped.startLine - 1), Math.max(0, mapped.startColumn)),
    new vscode.Position(Math.max(0, mapped.endLine - 1), Math.max(0, mapped.endColumn))
  );

  const diagnostic = new vscode.Diagnostic(range, mapped.message, vscode.DiagnosticSeverity.Warning);
  diagnostic.source = mapped.source;
  diagnostic.code = mapped.code;
  diagnostic.data = finding;
  return diagnostic;
}

export class DiagnosticsManager {
  private readonly collection: vscode.DiagnosticCollection;

  constructor() {
    this.collection = vscode.languages.createDiagnosticCollection('dead-code-eliminator');
  }

  setForUri(uri: vscode.Uri, findings: DeadCodeFinding[]): void {
    const diagnostics = findings.map(toDiagnostic);
    this.collection.set(uri, diagnostics);
  }

  setFromFindings(findings: DeadCodeFinding[]): void {
    const grouped = new Map<string, DeadCodeFinding[]>();
    for (const finding of findings) {
      const uri = vscode.Uri.file(finding.filePath).toString();
      if (!grouped.has(uri)) grouped.set(uri, []);
      grouped.get(uri)?.push(finding);
    }

    for (const [uri, items] of grouped.entries()) {
      this.collection.set(vscode.Uri.parse(uri), items.map(toDiagnostic));
    }
  }

  clearUri(uri: vscode.Uri): void {
    this.collection.delete(uri);
  }

  clearAll(): void {
    this.collection.clear();
  }

  getCollection(): vscode.DiagnosticCollection {
    return this.collection;
  }

  dispose(): void {
    this.collection.dispose();
  }
}

export const DiagnosticSource = SOURCE;
