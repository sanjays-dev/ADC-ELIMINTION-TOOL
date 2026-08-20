import * as vscode from 'vscode';
import { DeadCodeFinding } from '../types';
import { DiagnosticSource } from './diagnostics';
import { buildRemovalRange, canApplySafeRemoval } from '../utils/edits';
import { getQuickFixTitle } from './quickFixModel';

export class DeadCodeActionProvider implements vscode.CodeActionProvider {
  static readonly providedCodeActionKinds = [vscode.CodeActionKind.QuickFix];

  provideCodeActions(
    document: vscode.TextDocument,
    _range: vscode.Range,
    context: vscode.CodeActionContext
  ): vscode.CodeAction[] {
    const actions: vscode.CodeAction[] = [];

    for (const diagnostic of context.diagnostics) {
      if (diagnostic.source !== DiagnosticSource) {
        continue;
      }

      const finding = diagnostic.data as DeadCodeFinding | undefined;
      if (!finding || !canApplySafeRemoval(document, finding)) {
        continue;
      }

      const edit = new vscode.WorkspaceEdit();
      edit.delete(document.uri, buildRemovalRange(document, finding));

      const action = new vscode.CodeAction(getQuickFixTitle(finding), vscode.CodeActionKind.QuickFix);
      action.diagnostics = [diagnostic];
      action.edit = edit;
      action.isPreferred = true;
      actions.push(action);
    }

    return actions;
  }
}
