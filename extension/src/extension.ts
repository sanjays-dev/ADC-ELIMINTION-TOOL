import * as path from 'path';
import * as vscode from 'vscode';
import { analyzeCurrentFile, analyzeWorkspace, createWorkspaceEditPlan } from './core/analyzerAdapter';
import { DeadCodeFinding } from './types';
import { DeadCodeActionProvider } from './providers/codeActions';
import { DiagnosticsManager } from './providers/diagnostics';
import { buildRemovalRange } from './utils/edits';

const SUPPORTED_LANGUAGES = new Set(['javascript', 'typescript', 'javascriptreact', 'typescriptreact']);
const FINDINGS_BY_URI = new Map<string, DeadCodeFinding[]>();

function getConfig(): {
  enabled: boolean;
  analyzeOnSave: boolean;
  minConfidence: number;
  maxFileSizeKB: number;
} {
  const config = vscode.workspace.getConfiguration('deadCodeEliminator');
  return {
    enabled: config.get<boolean>('enable', true),
    analyzeOnSave: config.get<boolean>('analyzeOnSave', true),
    minConfidence: config.get<number>('minConfidence', 85),
    maxFileSizeKB: config.get<number>('maxFileSizeKB', 1024),
  };
}

function isSupportedDocument(document: vscode.TextDocument): boolean {
  return SUPPORTED_LANGUAGES.has(document.languageId) && !document.isUntitled;
}

function fileTooLarge(document: vscode.TextDocument, maxFileSizeKB: number): boolean {
  const bytes = Buffer.byteLength(document.getText(), 'utf8');
  return bytes > maxFileSizeKB * 1024;
}

function setFindingsForUri(uri: vscode.Uri, findings: DeadCodeFinding[]): void {
  FINDINGS_BY_URI.set(uri.toString(), findings);
}

function clearFindingsForUri(uri: vscode.Uri): void {
  FINDINGS_BY_URI.delete(uri.toString());
}

function getAllFindings(): DeadCodeFinding[] {
  return Array.from(FINDINGS_BY_URI.values()).flat();
}

async function analyzeDocument(document: vscode.TextDocument, diagnostics: DiagnosticsManager): Promise<void> {
  const config = getConfig();
  if (!config.enabled || !isSupportedDocument(document)) {
    return;
  }

  if (fileTooLarge(document, config.maxFileSizeKB)) {
    vscode.window.showWarningMessage(`Dead Code Eliminator skipped ${path.basename(document.fileName)} because it exceeds ${config.maxFileSizeKB}KB.`);
    return;
  }

  const result = await analyzeCurrentFile(document.fileName, document.getText(), config.minConfidence);
  const normalizedPath = path.normalize(document.fileName).replace(/\\/g, '/');
  const findings = result.findings.filter((finding) => finding.filePath === normalizedPath);

  setFindingsForUri(document.uri, findings);
  diagnostics.setForUri(document.uri, findings);

  if (result.issues.length > 0) {
    const firstIssue = result.issues[0];
    vscode.window.showWarningMessage(`Dead Code analysis warning in ${path.basename(firstIssue.filePath)}: ${firstIssue.message}`);
  }
}

async function analyzeWorkspaceCommand(diagnostics: DiagnosticsManager): Promise<void> {
  const config = getConfig();
  if (!config.enabled) {
    return;
  }

  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  if (!workspaceFolder) {
    vscode.window.showInformationMessage('Open a workspace folder to analyze dead code.');
    return;
  }

  await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: 'Dead Code: Analyzing workspace',
      cancellable: false,
    },
    async () => {
      const result = await analyzeWorkspace(workspaceFolder.uri.fsPath, config.minConfidence);
      diagnostics.clearAll();
      FINDINGS_BY_URI.clear();

      const grouped = new Map<string, DeadCodeFinding[]>();
      for (const finding of result.findings) {
        const uri = vscode.Uri.file(finding.filePath);
        const key = uri.toString();
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)?.push(finding);
      }

      for (const [key, findings] of grouped.entries()) {
        const uri = vscode.Uri.parse(key);
        setFindingsForUri(uri, findings);
        diagnostics.setForUri(uri, findings);
      }

      if (result.issues.length > 0) {
        vscode.window.showWarningMessage(`Dead Code analysis finished with ${result.issues.length} parse warning(s).`);
      } else {
        vscode.window.showInformationMessage(
          `Dead Code analysis completed. ${result.findings.length} finding(s) across ${result.analyzedFiles} file(s).`
        );
      }
    }
  );
}

async function removeSafeDeadCodeCommand(): Promise<void> {
  const allFindings = getAllFindings().filter((finding) => finding.removable);
  if (allFindings.length === 0) {
    vscode.window.showInformationMessage('No safe dead code findings are available to remove. Run an analysis first.');
    return;
  }

  const answer = await vscode.window.showWarningMessage(
    `Apply safe dead-code removals for ${allFindings.length} item(s)?`,
    { modal: true },
    'Apply',
    'Cancel'
  );

  if (answer !== 'Apply') {
    return;
  }

  const edit = new vscode.WorkspaceEdit();
  const textByPath = new Map<string, string>();

  for (const finding of allFindings) {
    try {
      const uri = vscode.Uri.file(finding.filePath);
      const doc = await vscode.workspace.openTextDocument(uri);
      textByPath.set(finding.filePath, doc.getText());
    } catch {
      // Ignore unreadable files.
    }
  }

  const removable = createWorkspaceEditPlan(allFindings, textByPath);
  const grouped = new Map<string, DeadCodeFinding[]>();
  for (const finding of removable) {
    if (!grouped.has(finding.filePath)) grouped.set(finding.filePath, []);
    grouped.get(finding.filePath)?.push(finding);
  }

  for (const [filePath, findings] of grouped.entries()) {
    const uri = vscode.Uri.file(filePath);
    const doc = await vscode.workspace.openTextDocument(uri);

    findings
      .slice()
      .sort((a, b) => b.startLine - a.startLine)
      .forEach((finding) => {
        edit.delete(uri, buildRemovalRange(doc, finding));
      });
  }

  const applied = await vscode.workspace.applyEdit(edit);
  if (!applied) {
    vscode.window.showErrorMessage('Dead Code Eliminator failed to apply safe edits.');
    return;
  }

  vscode.window.showInformationMessage(`Applied ${removable.length} safe dead-code removal(s).`);
}

export function activate(context: vscode.ExtensionContext): void {
  const diagnostics = new DiagnosticsManager();

  const selector: vscode.DocumentSelector = [
    { language: 'javascript', scheme: 'file' },
    { language: 'typescript', scheme: 'file' },
    { language: 'javascriptreact', scheme: 'file' },
    { language: 'typescriptreact', scheme: 'file' },
  ];

  context.subscriptions.push(
    diagnostics,
    vscode.languages.registerCodeActionsProvider(selector, new DeadCodeActionProvider(), {
      providedCodeActionKinds: DeadCodeActionProvider.providedCodeActionKinds,
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('deadCodeEliminator.analyzeCurrentFile', async () => {
      const editor = vscode.window.activeTextEditor;
      if (!editor || !isSupportedDocument(editor.document)) {
        vscode.window.showInformationMessage('Open a JavaScript or TypeScript file to analyze.');
        return;
      }
      await analyzeDocument(editor.document, diagnostics);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('deadCodeEliminator.analyzeWorkspace', async () => {
      await analyzeWorkspaceCommand(diagnostics);
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('deadCodeEliminator.removeSafeDeadCode', async () => {
      await removeSafeDeadCodeCommand();
    })
  );

  context.subscriptions.push(
    vscode.commands.registerCommand('deadCodeEliminator.clearDiagnostics', () => {
      diagnostics.clearAll();
      FINDINGS_BY_URI.clear();
      vscode.window.showInformationMessage('Dead Code diagnostics cleared.');
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidSaveTextDocument(async (document) => {
      const config = getConfig();
      if (!config.enabled || !config.analyzeOnSave || !isSupportedDocument(document)) {
        return;
      }
      await analyzeDocument(document, diagnostics);
    })
  );

  context.subscriptions.push(
    vscode.workspace.onDidCloseTextDocument((document) => {
      diagnostics.clearUri(document.uri);
      clearFindingsForUri(document.uri);
    })
  );
}

export function deactivate(): void {
  FINDINGS_BY_URI.clear();
}
