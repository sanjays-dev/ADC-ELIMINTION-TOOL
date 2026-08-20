import * as assert from 'assert';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { analyzeCurrentFile, analyzeWorkspace, createWorkspaceEditPlan } from '../src/core/analyzerAdapter';
import { findingToDiagnosticData } from '../src/providers/diagnosticModel';
import { getQuickFixTitle, isSafeAutoFix } from '../src/providers/quickFixModel';
import { DeadCodeFinding } from '../src/types';

function makeTempProject(files: Record<string, string>): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'adc-ext-test-'));
  for (const [name, content] of Object.entries(files)) {
    const absolute = path.join(dir, name);
    fs.mkdirSync(path.dirname(absolute), { recursive: true });
    fs.writeFileSync(absolute, content, 'utf8');
  }
  return dir;
}

describe('Dead Code Extension Core Adapter', () => {
  it('detects unused variable in JavaScript', async () => {
    const result = await analyzeCurrentFile('/tmp/a.js', 'const unusedVar = 1;\n', 0);
    assert.ok(result.findings.some((f) => f.type === 'unused-variable'));
  });

  it('detects unused function in JavaScript', async () => {
    const result = await analyzeCurrentFile('/tmp/b.js', 'function unusedFunction() {}\n', 0);
    assert.ok(result.findings.some((f) => f.type === 'unused-function'));
  });

  it('detects unused import in TypeScript', async () => {
    const project = makeTempProject({
      'index.ts': 'console.log("entry");\n',
      'feature.ts': "import fs from 'fs';\nconst v = 1;\n",
    });

    const result = await analyzeWorkspace(project, 0);
    assert.ok(result.findings.some((f) => f.type === 'unused-import' && f.filePath.endsWith('/feature.ts')));
  });

  it('detects unreachable code in JavaScript', async () => {
    const src = 'function x(){\n  return 1;\n  const z = 2;\n}\n';
    const result = await analyzeCurrentFile('/tmp/d.js', src, 0);
    assert.ok(result.findings.some((f) => f.type === 'unreachable-code'));
  });

  it('builds safe removal plan only for removable findings', () => {
    const filePath = path.resolve('/tmp/e.js').replace(/\\/g, '/');
    const finding: DeadCodeFinding = {
      id: 'a',
      type: 'unused-function',
      name: 'unusedFunction',
      message: 'Unused function detected: unusedFunction',
      filePath,
      startLine: 1,
      startColumn: 0,
      endLine: 2,
      endColumn: 1,
      confidence: 90,
      removable: true,
      reason: 'Not reachable',
    };

    const removable = createWorkspaceEditPlan([finding], new Map([[filePath, 'function unusedFunction() {\n}\n']]));
    assert.strictEqual(removable.length, 1);
  });

  it('converts finding into diagnostic data', () => {
    const finding: DeadCodeFinding = {
      id: 'diag-1',
      type: 'unused-variable',
      name: 'u',
      message: 'Unused variable detected: u',
      filePath: '/tmp/f.js',
      startLine: 2,
      startColumn: 0,
      endLine: 2,
      endColumn: 8,
      confidence: 90,
      removable: true,
      reason: 'Not reachable',
    };

    const data = findingToDiagnosticData(finding);
    assert.strictEqual(data.severity, 'warning');
    assert.strictEqual(data.code, 'diag-1');
  });

  it('generates quick fix metadata for removable findings', () => {
    const finding: DeadCodeFinding = {
      id: 'fix-1',
      type: 'unused-import',
      name: 'fs',
      message: 'Unused import detected: fs',
      filePath: '/tmp/g.ts',
      startLine: 1,
      startColumn: 0,
      endLine: 1,
      endColumn: 20,
      confidence: 95,
      removable: true,
      reason: 'Not reachable',
    };

    assert.strictEqual(getQuickFixTitle(finding), 'Remove unused import');
    assert.strictEqual(isSafeAutoFix(finding), true);
  });

  it('handles invalid syntax without crashing', async () => {
    const result = await analyzeCurrentFile('/tmp/h.js', 'function bad( {\n', 0);
    assert.ok(result.issues.length > 0);
  });

  it('supports workspace JavaScript analysis', async () => {
    const project = makeTempProject({
      'a.js': 'function unusedOne() {}\n',
      'index.js': 'console.log("entry");\n',
    });

    const result = await analyzeWorkspace(project, 0);
    assert.ok(result.findings.some((f) => f.filePath.endsWith('/a.js')));
  });

  it('supports workspace TypeScript analysis', async () => {
    const project = makeTempProject({
      'a.ts': 'function unusedTyped(): number { return 1; }\n',
      'index.ts': 'console.log("entry");\n',
    });

    const result = await analyzeWorkspace(project, 0);
    assert.ok(result.findings.some((f) => f.filePath.endsWith('/a.ts')));
  });
});
