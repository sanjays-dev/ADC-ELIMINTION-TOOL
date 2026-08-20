const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vscode = require('vscode');

const EXTENSION_ID = 'your-publisher-name.automated-dead-code-eliminator';

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitFor(predicate, timeoutMs, message) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const value = await predicate();
    if (value) {
      return value;
    }
    await delay(150);
  }
  throw new Error(message);
}

function extensionDiagnosticsFor(uri) {
  return vscode.languages
    .getDiagnostics(uri)
    .filter((d) => d.source === 'Dead Code Eliminator');
}

const FIXTURE_CONTENT = {
  deadJs: "function unusedFunction() {\n  return 42;\n}\n\nfunction usedFunction() {\n  return 'alive';\n}\n\nconsole.log(usedFunction());\n",
  featureTs: "import fs from 'fs';\n\nconst marker = 'x';\n\nconsole.log(marker);\n",
  indexTs: "console.log('entry');\n",
};

function resetFixtureWorkspace() {
  const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
  fs.writeFileSync(path.join(workspacePath, 'src', 'dead.js'), FIXTURE_CONTENT.deadJs, 'utf8');
  fs.writeFileSync(path.join(workspacePath, 'src', 'feature.ts'), FIXTURE_CONTENT.featureTs, 'utf8');
  fs.writeFileSync(path.join(workspacePath, 'index.ts'), FIXTURE_CONTENT.indexTs, 'utf8');
}

async function openDocument(relPath) {
  const workspacePath = vscode.workspace.workspaceFolders[0].uri.fsPath;
  const filePath = path.join(workspacePath, relPath);
  const document = await vscode.workspace.openTextDocument(vscode.Uri.file(filePath));
  await vscode.window.showTextDocument(document);
  return document;
}

describe('Dead Code Extension Integration', function () {
  this.timeout(90000);

  before(async () => {
    const extension = vscode.extensions.getExtension(EXTENSION_ID);
    assert.ok(extension, `Extension not found: ${EXTENSION_ID}`);
    await extension.activate();

    await vscode.workspace.getConfiguration('deadCodeEliminator').update('enable', true, vscode.ConfigurationTarget.Workspace);
    await vscode.workspace.getConfiguration('deadCodeEliminator').update('analyzeOnSave', false, vscode.ConfigurationTarget.Workspace);
    await vscode.workspace.getConfiguration('deadCodeEliminator').update('minConfidence', 0, vscode.ConfigurationTarget.Workspace);
  });

  beforeEach(async () => {
    resetFixtureWorkspace();
    await vscode.commands.executeCommand('workbench.action.closeAllEditors');
    await vscode.commands.executeCommand('deadCodeEliminator.clearDiagnostics');
  });

  it('analyzes current file and publishes diagnostics', async () => {
    const document = await openDocument(path.join('src', 'dead.js'));

    await vscode.commands.executeCommand('deadCodeEliminator.clearDiagnostics');
    await vscode.commands.executeCommand('deadCodeEliminator.analyzeCurrentFile');

    const diagnostics = await waitFor(
      async () => {
        const items = extensionDiagnosticsFor(document.uri);
        return items.length > 0 ? items : null;
      },
      12000,
      'Expected diagnostics for current file after analysis command.'
    );

    assert.ok(diagnostics.some((d) => String(d.message).toLowerCase().includes('unused function')));
  });

  it('offers and applies quick fix for removable dead code', async () => {
    const document = await openDocument(path.join('src', 'dead.js'));
    await vscode.commands.executeCommand('deadCodeEliminator.analyzeCurrentFile');

    const diagnostics = await waitFor(
      async () => {
        const items = extensionDiagnosticsFor(document.uri);
        return items.length > 0 ? items : null;
      },
      12000,
      'Expected diagnostics for quick fix scenario.'
    );

    const targetDiagnostic = diagnostics.find((d) => String(d.message).toLowerCase().includes('unused function')) || diagnostics[0];
    const codeActions = await vscode.commands.executeCommand(
      'vscode.executeCodeActionProvider',
      document.uri,
      targetDiagnostic.range,
      vscode.CodeActionKind.QuickFix.value
    );

    assert.ok(Array.isArray(codeActions) && codeActions.length > 0, 'Expected at least one quick fix action.');

    const quickFix = codeActions.find((a) => a.title && a.title.toLowerCase().includes('remove unused function')) || codeActions[0];
    assert.ok(quickFix && quickFix.edit, 'Expected quick fix action with WorkspaceEdit.');

    const applied = await vscode.workspace.applyEdit(quickFix.edit);
    assert.strictEqual(applied, true, 'Expected quick fix edit to apply.');

    const saved = await document.save();
    assert.strictEqual(saved, true, 'Expected updated document to save.');

    const updatedText = document.getText();
    assert.strictEqual(updatedText.includes('unusedFunction'), false, 'Expected unused function to be removed by quick fix.');
  });

  it('analyzes workspace and reports findings across files', async () => {
    const featureDoc = await openDocument(path.join('src', 'feature.ts'));

    await vscode.commands.executeCommand('deadCodeEliminator.clearDiagnostics');
    await vscode.commands.executeCommand('deadCodeEliminator.analyzeWorkspace');

    const diagnostics = await waitFor(
      async () => {
        const items = extensionDiagnosticsFor(featureDoc.uri);
        return items.length > 0 ? items : null;
      },
      20000,
      'Expected workspace diagnostics for feature.ts after workspace analysis.'
    );

    assert.ok(
      diagnostics.some((d) => String(d.message).toLowerCase().includes('unused import')),
      'Expected workspace analysis to flag unused import in TypeScript file.'
    );
  });
});
