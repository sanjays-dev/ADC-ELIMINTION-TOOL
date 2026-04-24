# API Reference

## Overview

The ADC Tool provides both CLI and programmatic APIs for dead code analysis.

---

## CLI Interface

### Commands

#### 1. `scan` - Analyze Project for Dead Code

```bash
adc-scan scan <projectPath> [options]
```

**Arguments:**
- `projectPath` - Path to the project root

**Options:**
```
-o, --output <file>          Save report to file
-f, --format <format>        Output format: 'json' or 'console' (default: console)
-e, --entryPoints <points>   Specify entry point files
--exclude <patterns>         File patterns to exclude
-v, --verbose               Enable verbose output
-h, --help                  Show help
```

**Examples:**
```bash
# Basic scan
adc-scan scan ./src

# With report
adc-scan scan ./src --output report.json --format json

# Specify entry points
adc-scan scan ./src --entryPoints ./src/main.ts ./src/app.ts

# Exclude directories
adc-scan scan ./src --exclude node_modules dist .git
```

#### 2. `report` - Generate Analysis Report

```bash
adc-scan report <projectPath> [options]
```

**Options:**
```
-o, --output <file>        Output report file (default: adc-report.json)
-f, --format <format>      Output format: 'json' or 'console' (default: json)
```

**Examples:**
```bash
adc-scan report ./src --output myreport.json
adc-scan report ./src --format console
```

#### 3. `clean` - Safe Code Removal

```bash
adc-scan clean <projectPath> [options]
```

**Options:**
```
-f, --force                Skip confirmation prompts
--confidence <score>       Minimum confidence (0-100, default: 85)
```

**Examples:**
```bash
# Interactive removal
adc-scan clean ./src

# High confidence only
adc-scan clean ./src --confidence 90

# Automatic (use with caution!)
adc-scan clean ./src --force --confidence 95
```

---

## Programmatic API

### Core Classes

#### 1. AnalysisEngine

Main orchestrator for dead code analysis.

```typescript
import { AnalysisEngine } from 'adc-tool';

const engine = new AnalysisEngine();

// Run analysis
const report = await engine.analyze({
  projectPath: './src',
  entryPoints: ['./src/index.ts'],
  exclude: ['node_modules', 'dist'],
  verbose: false
});

// Generate reports
const jsonReport = engine.generateReport(report, 'json');
const consoleReport = engine.generateReport(report, 'console');

// Save report
engine.saveReport(report, './report.json', 'json');
```

**Methods:**

```typescript
async analyze(options: AnalysisOptions): Promise<AnalysisReport>
```

```typescript
interface AnalysisOptions {
  projectPath: string;           // Required: project root path
  entryPoints?: string[];        // Optional: entry point files
  exclude?: string[];            // Optional: file patterns to exclude
  verbose?: boolean;             // Optional: verbose logging
}
```

Returns: `AnalysisReport` object containing all analysis results.

#### 2. CodeCleaner

Manages safe code removal.

```typescript
import { CodeCleaner } from 'adc-tool';

const cleaner = new CodeCleaner();

// Generate proposal
const proposal = cleaner.generateDeletionProposal(deadCodeItems);

// Preview changes
const preview = cleaner.previewChanges(proposal);
console.log(preview);

// Generate git diff
const diff = cleaner.generateGitDiff(proposal);

// Execute removal
const result = cleaner.removeDeadCode(proposal.safeToDelete);
console.log(`Removed: ${result.removed}, Failed: ${result.failed}`);

// Save proposal for later
cleaner.saveProposal(proposal, './cleanup-proposal.json');
```

**Methods:**

```typescript
generateDeletionProposal(items: DeadCodeItem[]): CleanupProposal

previewChanges(proposal: CleanupProposal): string

generateGitDiff(proposal: CleanupProposal): string

removeDeadCode(items: DeadCodeItem[]): { removed: number; failed: number }

saveProposal(proposal: CleanupProposal, filePath: string): boolean
```

#### 3. Reporter

Generates human-readable and machine-readable reports.

```typescript
import { Reporter } from 'adc-tool';

const reporter = new Reporter();

// Generate JSON report
const jsonReport = reporter.generateJsonReport(report);

// Generate console report
const consoleReport = reporter.generateConsoleReport(report);
console.log(consoleReport);

// Save report
reporter.saveReport(report, './report.json', 'json');
```

**Methods:**

```typescript
generateJsonReport(report: AnalysisReport): string

generateConsoleReport(report: AnalysisReport): string

saveReport(report: AnalysisReport, filePath: string, format?: 'json' | 'console'): boolean
```

#### 4. DeadCodeDetector

Classifies dead code and assigns confidence scores.

```typescript
import { DeadCodeDetector } from 'adc-tool';

const detector = new DeadCodeDetector(nodes, reachableSet, unreachableSet);

// Detect dead code
const deadCode = detector.detectDeadCode();

// Classify by severity
const { definite, probable, uncertain } = detector.classifyBySeverity(deadCode);

// Get overall confidence
const confidence = detector.calculateOverallConfidence(deadCode);
```

#### 5. ReachabilityAnalyzer

Performs DFS-based reachability analysis.

```typescript
import { ReachabilityAnalyzer } from 'adc-tool';

const analyzer = new ReachabilityAnalyzer(nodes, edges, entryPoints);
const { reachable, unreachable } = analyzer.analyze();
```

#### 6. DependencyGraphBuilder

Builds cross-file dependency graph.

```typescript
import { DependencyGraphBuilder } from 'adc-tool';

const builder = new DependencyGraphBuilder(basePath);

// Add nodes and edges
builder.addNode(graphNode);
builder.addEdge(fromId, toId, 'call');

// Extract from AST
builder.extractFromParsedFile(filePath, parsedFile);

// Get graph
const { nodes, edges } = builder.getGraph();
```

---

## REST API (Web Server)

### Base URL

```
http://localhost:3000
```

### Endpoints

#### POST /api/scan

Initiate a project scan.

**Request:**
```json
{
  "projectPath": "/path/to/project"
}
```

**Response:**
```json
{
  "success": true,
  "reportId": "report-1234567890",
  "summary": {
    "totalFiles": 42,
    "totalNodes": 1250,
    "deadCodeItems": 87,
    "codeReductionPercentage": 12.5,
    "confidenceScore": 82
  }
}
```

#### GET /api/report/:reportId

Retrieve analysis report.

**Response:**
```json
{
  "projectPath": "/path/to/project",
  "scanDate": "2024-01-15T10:30:00Z",
  "totalFiles": 42,
  "deadCodeItems": [...],
  ...
}
```

#### POST /api/cleanup-proposal

Generate cleanup proposal.

**Request:**
```json
{
  "reportId": "report-1234567890",
  "minConfidence": 85
}
```

**Response:**
```json
{
  "proposalId": "proposal-1234567890",
  "summary": {
    "safeToDelete": 42,
    "uncertain": 15
  },
  "preview": "..."
}
```

#### POST /api/cleanup-execute

Execute code removal.

**Request:**
```json
{
  "proposalId": "proposal-1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "removed": 42,
  "failed": 0,
  "message": "Removed 42 dead code items"
}
```

#### GET /api/report/:reportId/export

Download report as JSON file.

**Response:** JSON file with report data

---

## Type Definitions

### AnalysisReport

```typescript
interface AnalysisReport {
  projectPath: string;
  scanDate: string;
  totalFiles: number;
  totalNodes: number;
  deadCodeItems: DeadCodeItem[];
  reachableNodes: Set<string>;
  unreachableNodes: Set<string>;
  entryPoints: string[];
  totalDeadCodeLines: number;
  codeReductionPercentage: number;
  confidenceScore: number;
  summary: {
    totalDeadFunctions: number;
    totalDeadVariables: number;
    totalUnusedImports: number;
    totalUnreachableFiles: number;
  };
}
```

### DeadCodeItem

```typescript
interface DeadCodeItem {
  id: string;
  type: 'unused-function' | 'unused-variable' | 'unused-import' | 'unreachable-code' | 'unreachable-file';
  name: string;
  filePath: string;
  line: number;
  column: number;
  confidenceScore: number;  // 0-100
  reason: string;
  isDynamic: boolean;
  codeSnippet?: string;
}
```

### GraphNode

```typescript
interface GraphNode {
  id: string;
  name: string;
  type: 'function' | 'variable' | 'class' | 'import' | 'export' | 'module' | 'property' | 'method';
  filePath: string;
  line: number;
  column: number;
  isDynamic: boolean;
  isExported?: boolean;
  isDefault?: boolean;
}
```

---

## Error Handling

### CLI Errors

The CLI exits with appropriate codes:
- `0` - Success
- `1` - General error
- `2` - Invalid arguments

### API Errors

```json
{
  "error": "Error message",
  "statusCode": 400
}
```

---

## Integration Examples

### Node.js Integration

```typescript
import { AnalysisEngine, CodeCleaner } from 'adc-tool';

async function runAnalysis() {
  const engine = new AnalysisEngine();
  
  // Analyze
  const report = await engine.analyze({
    projectPath: './src'
  });
  
  console.log(`Found ${report.deadCodeItems.length} dead code items`);
  
  // Propose cleanup
  const cleaner = new CodeCleaner();
  const proposal = cleaner.generateDeletionProposal(
    report.deadCodeItems.filter(i => i.confidenceScore >= 90)
  );
  
  console.log(cleaner.previewChanges(proposal));
  
  // Remove code
  const result = cleaner.removeDeadCode(proposal.safeToDelete);
  console.log(`Cleaned ${result.removed} items`);
}

runAnalysis().catch(console.error);
```

### CI/CD Integration

```bash
# .github/workflows/deadcode.yml
- name: Run Dead Code Analysis
  run: npx adc-scan scan ./src --output report.json

- name: Upload Report
  uses: actions/upload-artifact@v2
  with:
    name: dead-code-report
    path: report.json
```

---

## Performance Tuning

### Large Projects

```typescript
// Increase memory
process.env.NODE_OPTIONS = '--max-old-space-size=4096';

// Specify entry points to limit scope
const report = await engine.analyze({
  projectPath: './src',
  entryPoints: ['./src/main.ts'],
  exclude: ['node_modules', 'dist', '.git']
});
```

### Parallel Processing

The tool automatically optimizes parsing with:
- Lazy AST generation
- Incremental graph building
- Cached results

---

## Troubleshooting

### No Dead Code Found

- Check that entry points are correctly specified
- Verify files aren't being excluded
- Review reachability algorithm logic

### High Memory Usage

- Reduce project scope with `--exclude`
- Split analysis into smaller projects
- Increase available memory

### Confidence Score Too Low

- Review dynamic code detection
- Check for reflection usage
- Inspect the analysis logs with `--verbose`

---

For more examples and use cases, see the README.md and example projects.
