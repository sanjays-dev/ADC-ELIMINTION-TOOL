const vscode = require('vscode');
const path = require('path');
const cp = require('child_process');
const fs = require('fs');

/**
 * Activate the extension.
 */
function activate(context) {
  const output = vscode.window.createOutputChannel('ADC Elim');

  function getWorkspacePath() {
    const folders = vscode.workspace.workspaceFolders;
    if (folders && folders.length > 0) {
      return folders[0].uri.fsPath;
    }

    return process.cwd();
  }

  function runTool(args = []) {
    const extPath = context.extensionPath;
    const binDir = path.join(extPath, 'bin');
    const binBase = process.platform === 'win32' ? 'adc-scan.exe' : 'adc-scan';
    const binPath = path.join(binDir, binBase);

    if (!fs.existsSync(binPath)) {
      vscode.window.showErrorMessage('ADC binary not found. Run build scripts to prepare binaries.');
      return;
    }

    output.show(true);
    output.appendLine(`Running: ${binPath} ${args.join(' ')}`);

    const proc = cp.spawn(binPath, args, { cwd: getWorkspacePath() });

    proc.stdout.on('data', d => output.append(d.toString()));
    proc.stderr.on('data', d => output.append(d.toString()));
    proc.on('close', code => {
      output.appendLine(`Process exited with code ${code}`);
      if (code === 0) vscode.window.showInformationMessage('ADC tool finished successfully');
      else vscode.window.showWarningMessage('ADC tool exited with code ' + code);
    });
  }

  const scanCmd = vscode.commands.registerCommand('adc-scan.scan', () => {
    const folder = getWorkspacePath();
    runTool(['scan', folder, '--format', 'console']);
  });

  const cleanCmd = vscode.commands.registerCommand('adc-scan.clean', () => {
    const folder = getWorkspacePath();
    vscode.window.showWarningMessage('Proceed with cleaning?', 'Yes', 'No').then(ans => {
      if (ans === 'Yes') runTool(['clean', folder, '--force']);
    });
  });

  const reportCmd = vscode.commands.registerCommand('adc-scan.report', () => {
    const folder = getWorkspacePath();
    runTool(['report', folder, '--format', 'json', '--output', 'adc-report.json']);
  });

  context.subscriptions.push(scanCmd, cleanCmd, reportCmd, output);
}

function deactivate() {}

module.exports = { activate, deactivate };
