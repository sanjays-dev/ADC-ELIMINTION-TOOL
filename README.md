# Automated Dead Code Elimination Tool (ADC)

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Built with TypeScript](https://img.shields.io/badge/Built%20with-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Node.js Version](https://img.shields.io/badge/Node.js-16%2B-brightgreen.svg)](https://nodejs.org/)

**A production-ready tool to detect, analyze, and safely remove dead code from your JavaScript/TypeScript projects**

[Features](#features) • [Installation](#installation) • [Quick Start](#quick-start) • [Documentation](#documentation) • [API Reference](#api-reference)

</div>

---

## 🎯 Overview

The **Automated Dead Code Elimination Tool (ADC)** is a comprehensive system that scans your entire source code project, analyzes it using Abstract Syntax Trees (AST), builds a sophisticated dependency graph, detects unused or unreachable code, and can optionally remove it safely.

### Key Capabilities

- ✅ **Complete Project Scanning** - Analyzes all JS/TS files in your project
- ✅ **AST-Based Analysis** - Uses Babel parser for accurate code understanding
- ✅ **Dependency Graphing** - Builds cross-file function/variable relationships
- ✅ **Reachability Analysis** - DFS traversal to identify unreachable code
- ✅ **Classification** - Categorizes dead code (unused functions, variables, imports)
- ✅ **Confidence Scoring** - 0-100% confidence rating for each finding
- ✅ **Safe Removal** - Proposes changes with preview before deletion
- ✅ **Web UI** - Interactive dashboard for visualization
- ✅ **CLI Tool** - Command-line interface for automation
- ✅ **JSON Reports** - Machine-readable analysis reports

---

## 🚀 Quick Start

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/adc-tool.git
cd adc-tool

# Install dependencies
npm install

# Build the project
npm run build
```

### Basic Usage

#### CLI - Scan for Dead Code

```bash
# Simple scan with console output
adc-scan scan ./src

# Save detailed JSON report
adc-scan scan ./src --output ./report.json --format json

# Specify entry points
adc-scan scan ./src --entryPoints ./src/index.ts ./src/main.ts

# With verbose output
adc-scan scan ./src --verbose
```

#### CLI - Generate Reports

```bash
# Generate detailed analysis report
adc-scan report ./src --output ./analysis-report.json

# Save console-formatted report
adc-scan report ./src --output ./report.txt --format console
```

#### CLI - Safe Code Removal

```bash
# Preview changes before removal (requires confirmation)
adc-scan clean ./src

# Automatic removal with 90%+ confidence
adc-scan clean ./src --confidence 90

# Force removal without prompts
adc-scan clean ./src --force
```

#### Web UI

```bash
# Start both API server and web frontend
npm run web:all

# Or start separately
npm run web              # Backend API on http://localhost:3000
npm run web:frontend     # Frontend on http://localhost:3001
```

Then navigate to `http://localhost:3001` to access the web dashboard.

---

## 📋 Features

### 1. Dead Code Detection

The tool identifies and classifies:

- **Unused Functions** - Declared but never called
- **Unused Variables** - Declared but never referenced
- **Unused Imports** - Imported but not used in code
- **Unreachable Code** - Defined but not reachable from entry points
- **Unreachable Files** - Modules not connected to project entry points
- **Dynamic Code** - Marked as "uncertain" (eval, dynamic imports)

### 2. Smart Analysis

- **Entry Point Detection** - Automatically finds main files (index.ts, main.ts, etc.)
- **Cross-File Dependencies** - Understands imports, exports, and function calls
- **Dynamic Code Detection** - Flags eval(), dynamic requires as uncertain
- **Circular Dependency Handling** - Correctly handles mutual dependencies
- **Scope Analysis** - Distinguishes local vs. exported symbols

### 3. Confidence Scoring

Each finding includes a confidence score (0-100%):

- **85-100%** ✅ Definite dead code (safe to remove)
- **65-84%** ⚠️ Probable dead code (review before removing)
- **0-64%** ❓ Uncertain (may be dynamically used)

Scores adjust based on:
- How clearly unused the code is
- Whether it's dynamically referenced
- Export/public API status
- Complexity of call patterns

### 4. Safe Removal

- **Preview Before Delete** - Shows exact lines to be removed
- **Confidence Filtering** - Only remove code above confidence threshold
- **User Confirmation** - Requires explicit approval before making changes
- **Git Integration** - Generates git diffs for changes
- **Rollback Support** - Changes saved for undo if needed

### 5. Comprehensive Reporting

Generate analysis reports with:

```json
{
  "projectPath": "/path/to/project",
  "scanDate": "2024-01-15T10:30:00Z",
  "totalFiles": 42,
  "totalNodes": 1250,
  "deadCodeItems": 87,
  "codeReductionPercentage": 12.5,
  "confidenceScore": 82,
  "summary": {
    "totalDeadFunctions": 34,
    "totalDeadVariables": 28,
    "totalUnusedImports": 15,
    "totalUnreachableFiles": 10
  },
  "deadCode": [
    {
      "type": "unused-function",
      "name": "legacyHelper",
      "filePath": "src/utils.ts",
      "line": 145,
      "confidenceScore": 95,
      "reason": "Function is never called from reachable code",
      "codeSnippet": "function legacyHelper(x) { return x * 2; }"
    }
  ]
}
```

---

## 🏗️ Architecture

### Module Structure

```
┌─────────────────────────────────────────┐
│          CLI / Web UI                    │
├─────────────────────────────────────────┤
│          Analysis Engine                 │
├──────────────┬──────────────┬────────────┤
│   Parser     │   Detector   │  Reporter  │
├──────────────┼──────────────┼────────────┤
│ Graph Builder│  Analyzer    │  Cleaner   │
├──────────────┴──────────────┴────────────┤
│          AST Utils / File Utils           │
└─────────────────────────────────────────┘
```

### Core Components

#### 1. Parser Module (`parser.ts`)
Converts source files to Abstract Syntax Trees (AST) using Babel parser.
- Handles TypeScript, JSX, modern JavaScript syntax
- Extracts function/class/variable declarations
- Handles syntax errors gracefully

#### 2. Graph Builder (`graphBuilder.ts`)
Creates a dependency graph from AST nodes.
- **Nodes**: Functions, variables, classes, imports, exports
- **Edges**: Function calls, imports, references, dependencies
- Cross-file relationship tracking

#### 3. Analyzer (`analyzer.ts`)
Performs reachability analysis using Depth-First Search (DFS).
- Identifies entry points
- Traverses reachable code paths
- Marks unreachable nodes as dead code

#### 4. Detector (`detector.ts`)
Classifies dead code and assigns confidence scores.
- Type classification (function, variable, import, etc.)
- Confidence scoring based on detection certainty
- Dynamic code flagging

#### 5. Reporter (`reporter.ts`)
Generates human-readable and machine-readable reports.
- Console output with color formatting
- JSON export for integration
- Summary statistics and metrics

#### 6. Cleaner (`cleaner.ts`)
Safely removes detected dead code.
- Generates deletion proposals
- Creates git diffs for review
- Safe file removal with confirmation

---

## 📊 Usage Examples

### Example 1: Analyze a Project

```typescript
import { AnalysisEngine } from 'adc-tool';

const engine = new AnalysisEngine();

const report = await engine.analyze({
  projectPath: './src',
  entryPoints: ['./src/index.ts'],
  verbose: true
});

console.log(`Found ${report.deadCodeItems.length} dead code items`);
console.log(`Confidence: ${report.confidenceScore}%`);
```

### Example 2: Safe Code Removal

```typescript
import { CodeCleaner } from 'adc-tool';

const cleaner = new CodeCleaner();

// Create a removal proposal
const proposal = cleaner.generateDeletionProposal(deadCodeItems);

// Review the proposal
console.log(cleaner.previewChanges(proposal));

// Execute removal
const result = cleaner.removeDeadCode(proposal.safeToDelete);
console.log(`Removed ${result.removed} items`);
```

### Example 3: Generate Reports

```typescript
import { Reporter } from 'adc-tool';

const reporter = new Reporter();

// Generate JSON report
const jsonReport = reporter.generateJsonReport(report);
reporter.saveReport(report, './report.json', 'json');

// Generate console report
const consoleReport = reporter.generateConsoleReport(report);
console.log(consoleReport);
```

---

## 🎮 Web UI Features

### Dashboard

- Project overview with statistics
- Dead code visualization
- Severity breakdown (Definite/Probable/Uncertain)
- Code reduction metrics

### Interactive Graph

- Visual dependency graph (D3.js)
- Node filtering and search
- Call chain visualization
- Export graph as image

### Analysis Results

- Detailed dead code list with confidence scores
- Code snippet preview
- File and line number references
- Sortable and filterable results

### Cleanup Management

- Propose deletions by confidence level
- Preview changes before applying
- Batch operations
- History of cleanup operations

---

## 🔧 Configuration

### CLI Options

```bash
adc-scan scan <projectPath> [options]

Options:
  -o, --output <file>          Output report file
  -f, --format <format>        json or console (default: console)
  -e, --entryPoints <points>   Entry point files
  --exclude <patterns>         Exclude file patterns
  -v, --verbose               Verbose output
  -h, --help                  Show help
```

### API Options

```typescript
interface AnalysisOptions {
  projectPath: string;
  entryPoints?: string[];      // Default: auto-detected
  exclude?: string[];          // Default: node_modules, dist, build
  verbose?: boolean;           // Default: false
}
```

---

## 📈 Performance

- **Small Projects** (< 100 files): ~1-2 seconds
- **Medium Projects** (100-1000 files): ~5-15 seconds
- **Large Projects** (1000+ files): ~30-120 seconds

*Times vary based on file size and complexity*

### Optimization Tips

1. Exclude large node_modules directories
2. Specify explicit entry points
3. Run on modern hardware for faster AST parsing
4. Use `--verbose` only for debugging

---

## ⚠️ Limitations & Considerations

### Known Limitations

1. **Dynamic Code** - Cannot detect dynamically required modules (`require(variableName)`)
2. **Reflection** - Limited support for code using reflection/introspection
3. **String-based References** - May miss references in strings
4. **Framework Magic** - Some framework decorators may not be tracked
5. **Type-Only Imports** - TypeScript type-only imports are correctly handled but need explicit `type` keyword

### Safety Considerations

- Always review the analysis report before removing code
- Use version control (Git) to track changes
- Test thoroughly after cleanup
- Start with high confidence scores (85%+)
- Use `--force` flag cautiously

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Test specific module
npm test -- parser

# Watch mode for development
npm test -- --watch
```

### Example Project

The repository includes a sample project for testing:

```bash
cd example/sample-project
adc-scan scan .
```

This demonstrates the tool on real code with intentional dead code.

---

## 📦 Output Examples

### Console Output

```
═══════════════════════════════════════════
   Automated Dead Code Elimination Tool
═══════════════════════════════════════════

Project: /home/user/project
Scan Date: 2024-01-15T10:30:00Z
Confidence Score: 82%

📊 Summary
─────────────────────────────────────────
Total Files Scanned:    42
Total Nodes Analyzed:   1250
Dead Code Items Found:  87
Potential Code Removed: 450 lines (12.5%)

🔴 Dead Code Classification
─────────────────────────────────────────
Unused Functions:    34
Unused Variables:    28
Unused Imports:      15
Unreachable Files:   10

📝 Dead Code Items

src/utils.ts
  🔴 Line 145: legacyHelper (✅ 95% confidence)
     "function legacyHelper(x) { return x * 2; }"
  🟡 Line 234: deprecatedConfig (⚠️ 72% confidence)
     "const deprecatedConfig = { ... }"

═══════════════════════════════════════════
```

### JSON Report

```json
{
  "projectPath": "/home/user/project",
  "scanDate": "2024-01-15T10:30:00Z",
  "totalFiles": 42,
  "totalNodes": 1250,
  "totalDeadCodeItems": 87,
  "totalDeadCodeLines": 450,
  "codeReductionPercentage": 12.5,
  "confidenceScore": 82,
  "summary": {
    "totalDeadFunctions": 34,
    "totalDeadVariables": 28,
    "totalUnusedImports": 15,
    "totalUnreachableFiles": 10
  },
  "deadCode": [
    {
      "id": "src/utils.ts:legacyHelper:145",
      "type": "unused-function",
      "name": "legacyHelper",
      "filePath": "src/utils.ts",
      "line": 145,
      "confidenceScore": 95,
      "reason": "Function is never called from reachable code",
      "isDynamic": false,
      "codeSnippet": "function legacyHelper(x) { return x * 2; }"
    }
  ]
}
```

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **Babel Team** - For the excellent AST parser
- **Commander.js** - For CLI framework
- **Chalk** - For terminal colors
- **D3.js** - For graph visualization

---

## 📞 Support

- 📖 [Documentation](./docs)
- 💬 [GitHub Issues](https://github.com/yourusername/adc-tool/issues)
- 📧 Email: support@example.com

---

## 🗺️ Roadmap

- [ ] Python/Java support
- [ ] Real-time file watching
- [ ] VS Code extension
- [ ] Integration with CI/CD pipelines
- [ ] Machine learning for confidence scoring
- [ ] Cloud-based analysis dashboard
- [ ] IDE plugins (IntelliJ, VS Code)

---

**Built with ❤️ by the ADC Team**
