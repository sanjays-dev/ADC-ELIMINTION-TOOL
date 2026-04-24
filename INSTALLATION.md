# Installation & Setup Guide

## Prerequisites

- **Node.js** 16.0.0 or higher
- **npm** 7.0.0 or higher
- **Git** (optional, for version control)

## Installation Steps

### Step 1: Clone or Download the Project

```bash
# Using Git
git clone https://github.com/yourusername/adc-tool.git
cd adc-tool

# Or download as ZIP and extract
unzip adc-tool.zip
cd adc-tool
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs all required packages:
- TypeScript compiler
- Babel parser for AST
- Commander for CLI
- Express for API server
- Development tools (eslint, prettier, jest)

### Step 3: Build the Project

```bash
# Compile TypeScript to JavaScript
npm run build

# Watch mode (recompile on file changes)
npm run build -- --watch
```

The compiled code will be in the `dist/` directory.

### Step 4: Verify Installation

```bash
# Test the CLI
npm run dev scan ./example/sample-project

# Or after build:
npm start scan ./example/sample-project
```

You should see analysis results and the confidence scores for the sample project.

---

## Running the Tool

### Option A: CLI Interface

#### Scan a Project

```bash
# Basic scan
npm start scan ./path/to/your/project

# With options
npm start scan ./src --output ./report.json --verbose
```

#### Generate Reports

```bash
npm start report ./src --output ./analysis.json
```

#### Clean Code (with confirmation)

```bash
npm start clean ./src --confidence 85
```

### Option B: Web UI

```bash
# Start API server
npm run web

# In another terminal, start web frontend
cd web
npm start
```

Access the web dashboard at `http://localhost:3000`

### Option C: Programmatic API

```typescript
import { AnalysisEngine } from './dist/index.js';

const engine = new AnalysisEngine();
const report = await engine.analyze({
  projectPath: './src'
});

console.log(report);
```

---

## Project Structure

```
adc-tool/
├── dist/                  # Compiled JavaScript (after npm run build)
├── src/
│   ├── parser.ts         # AST parser module
│   ├── graphBuilder.ts   # Dependency graph builder
│   ├── analyzer.ts       # Reachability analyzer
│   ├── detector.ts       # Dead code detector
│   ├── reporter.ts       # Report generator
│   ├── cleaner.ts        # Safe code remover
│   ├── engine.ts         # Main analysis engine
│   ├── cli.ts            # CLI interface
│   ├── server.ts         # Express API server
│   ├── fileUtils.ts      # File utilities
│   ├── astUtils.ts       # AST utilities
│   ├── types.ts          # TypeScript interfaces
│   └── index.ts          # Main entry point
├── example/
│   └── sample-project/   # Example project for testing
├── web/                  # Web UI (React)
├── docs/                 # Documentation
├── test/                 # Test files
├── package.json          # Project configuration
├── tsconfig.json         # TypeScript configuration
└── README.md             # This file
```

---

## Configuration

### Environment Variables

Create a `.env` file in the project root:

```bash
# API Server
PORT=3000
NODE_ENV=development

# Analysis
MAX_FILES=5000
ANALYSIS_TIMEOUT=60000

# Logging
LOG_LEVEL=info
```

### Entry Points Configuration

Specify custom entry points:

```bash
npm start scan ./src --entryPoints ./src/index.ts ./src/cli.ts
```

Or in code:

```typescript
const report = await engine.analyze({
  projectPath: './src',
  entryPoints: ['./src/index.ts', './src/cli.ts']
});
```

### Exclude Patterns

```bash
npm start scan ./src --exclude node_modules dist build coverage
```

---

## Development

### Install Development Dependencies

```bash
npm install --save-dev typescript ts-node @types/node jest ts-jest
```

### Compile TypeScript

```bash
npm run build
```

### Run Linter

```bash
npm run lint
```

### Format Code

```bash
npm run format
```

### Run Tests

```bash
npm test
```

---

## Troubleshooting

### Issue: Command not found `adc-scan`

**Solution**: Install globally or use `npm start`:

```bash
npm install -g .
adc-scan scan ./src

# Or use npm start
npm start scan ./src
```

### Issue: Parse error - Invalid syntax

**Solution**: Ensure all files are valid JavaScript/TypeScript. The tool should report which files have parse errors.

### Issue: Out of memory for large projects

**Solution**: Increase Node memory:

```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start scan ./large-project
```

### Issue: Web UI not loading

**Solution**: Ensure both services are running:

```bash
# Terminal 1: API Server
npm run web

# Terminal 2: Web Frontend (in web/ directory)
cd web && npm start
```

### Issue: Changes not reflected in output

**Solution**: Rebuild the project:

```bash
npm run build
npm start scan ./src
```

---

## Performance Tips

### For Large Projects

1. **Specify Entry Points** - Reduces analysis scope
   ```bash
   npm start scan ./src --entryPoints ./src/main.ts
   ```

2. **Exclude Non-Source Files**
   ```bash
   npm start scan ./src --exclude node_modules dist build .git
   ```

3. **Increase Timeout** - For very large projects
   ```bash
   NODE_OPTIONS="--max-old-space-size=8192" npm start scan ./src
   ```

4. **Increase Worker Threads** - For parallel parsing
   - Modify `parser.ts` to use worker threads

---

## Integration with CI/CD

### GitHub Actions

```yaml
name: Dead Code Analysis

on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - run: npm install
      - run: npm run build
      - run: npm start scan ./src --output ./report.json
      - run: npm start clean ./src --confidence 90 --force
      - run: git diff
```

### GitLab CI

```yaml
dead_code_analysis:
  image: node:16
  script:
    - npm install
    - npm run build
    - npm start scan ./src
```

---

## Next Steps

1. **Read the Main README** - Understand features and capabilities
2. **Try the CLI** - Run on the sample project or your own
3. **Explore Web UI** - Start the web server and interact with the dashboard
4. **Review Sample Report** - Check `example/sample-project` analysis
5. **Configure for Your Project** - Set up entry points and exclusions

---

## Getting Help

- Check the [README.md](./README.md) for feature documentation
- Review the [example project](./example/sample-project) for reference
- Check source code comments for implementation details
- Open an issue on GitHub for bugs or feature requests

---

## License

MIT License - see [LICENSE](LICENSE) for details
