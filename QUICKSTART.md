# Quick Start Guide

Get up and running with the ADC Tool in 5 minutes!

## Installation

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Done! You're ready to use the tool.
```

## Usage

### Option 1: CLI (Easiest)

```bash
# Scan for dead code
npm start scan ./example-index.ts

# Save report
npm start report ./example-index.ts --output report.json

# Remove dead code (with confirmation)
npm start clean ./example-index.ts
```

### Option 2: Web UI

```bash
# Terminal 1: Start API Server
npm run web

# Terminal 2: Start Web Dashboard (from web/ directory)
cd web && npm start

# Then open http://localhost:3000
```

### Option 3: Programmatic

```typescript
import { AnalysisEngine } from './dist/index.js';

const engine = new AnalysisEngine();
const report = await engine.analyze({
  projectPath: './src'
});

console.log(report);
```

## Examples

### Analyze Your Project

```bash
npm start scan ./src
```

Output:
```
═══════════════════════════════════════════
   Automated Dead Code Elimination Tool
═══════════════════════════════════════════

Project: /home/user/myproject/src
Confidence Score: 82%

📊 Summary
─────────────────────────────────────────
Total Files Scanned:    15
Total Nodes Analyzed:   342
Dead Code Items Found:  28
Potential Code Removed: 180 lines (8.5%)

🔴 Dead Code Classification
─────────────────────────────────────────
Unused Functions:    12
Unused Variables:    10
Unused Imports:      4
Unreachable Files:   2
```

### Save Detailed Report

```bash
npm start report ./src --output analysis.json --format json
```

### Review Before Removing

```bash
npm start clean ./src --confidence 90
```

This will show you exactly what will be removed before asking for confirmation.

## Understanding Confidence Scores

- **85-100%** ✅ **Definite** - Safe to remove
- **65-84%** ⚠️ **Probable** - Review before removing
- **0-64%** ❓ **Uncertain** - Likely dynamic code

## Project Structure

```
adc-tool/
├── *.ts                # Core modules
├── package.json        # Dependencies & scripts
├── tsconfig.json       # TypeScript config
├── README.md           # Full documentation
├── INSTALLATION.md     # Detailed setup
├── ARCHITECTURE.md     # System design
├── API_REFERENCE.md    # API documentation
└── example-*.ts        # Sample files
```

## Next Steps

1. **Read the README** - `README.md` for complete features
2. **Review Architecture** - `ARCHITECTURE.md` for system design
3. **Check API Docs** - `API_REFERENCE.md` for all options
4. **Run on Sample** - Try on the example files included
5. **Analyze Your Project** - Use on your own codebase

## Common Tasks

### Find High-Confidence Dead Code

```bash
# Only show 95%+ confidence items
npm start scan ./src | grep "95\|96\|97\|98\|99\|100"
```

### Generate JSON Report for CI/CD

```bash
npm start report ./src --output report.json --format json
```

### Automatically Remove Safe Dead Code

```bash
# Remove code with 95%+ confidence (no confirmation)
npm start clean ./src --confidence 95 --force
```

### Analyze Specific Entry Points

```bash
npm start scan ./src --entryPoints ./src/main.ts ./src/app.ts
```

### Exclude Directories

```bash
npm start scan ./src --exclude node_modules dist .git coverage
```

## Troubleshooting

### "npm: command not found"
Install Node.js from https://nodejs.org

### "Cannot find module"
Run `npm install` again

### "Permission denied"
Use `sudo` or fix file permissions

### Out of memory on large projects
```bash
NODE_OPTIONS="--max-old-space-size=4096" npm start scan ./src
```

## Getting Help

- **Full Documentation**: See `README.md`
- **API Reference**: See `API_REFERENCE.md`
- **System Design**: See `ARCHITECTURE.md`
- **Setup Help**: See `INSTALLATION.md`
- **Source Code**: Read comments in `*.ts` files

## Support

- 📖 Check the documentation files
- 💬 Review source code comments
- 📧 Create an issue on GitHub

---

**Ready? Try it now:** `npm start scan ./example-index.ts`
