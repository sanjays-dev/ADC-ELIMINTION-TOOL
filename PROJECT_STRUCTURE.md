# ADC Tool - Complete Project Structure

This directory contains the Automated Dead Code Elimination Tool - a comprehensive system for detecting and removing unused code.

## 📁 Files Overview

### Core Modules (at root level - will be organized after setup)

1. **types.ts** - TypeScript interfaces and type definitions
2. **fileUtils.ts** - File system operations and utilities
3. **astUtils.ts** - Abstract Syntax Tree utilities
4. **parser.ts** - Code parser using Babel
5. **graphBuilder.ts** - Dependency graph construction
6. **analyzer.ts** - Reachability analysis engine
7. **detector.ts** - Dead code detection and classification
8. **reporter.ts** - Report generation (JSON, console)
9. **cleaner.ts** - Safe code removal system
10. **engine.ts** - Main analysis orchestrator
11. **cli.ts** - Command-line interface
12. **server.ts** - Express API server for web UI
13. **index.ts** - Main entry point

### Configuration Files

- **package.json** - Project dependencies and scripts
- **tsconfig.json** - TypeScript configuration
- **.gitignore** - Git ignore rules
- **tsconfig.json** - TypeScript compiler options

### Documentation

- **README.md** - Main documentation
- **INSTALLATION.md** - Setup and installation guide
- **ARCHITECTURE.md** - System design documentation (to be created)

### Build & Setup Scripts

- **setup.js** - Directory creation script
- **create-dirs.bat** - Windows batch script for directories
- **create-dirs.sh** - Unix shell script for directories
- **build-setup.js** - Comprehensive build setup

### Example Project

- **example/sample-project/** - Example project with intentional dead code

### Web UI

- **web/** - React-based web interface (to be created after setup)

## 🚀 Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Build the project
npm run build

# 3. Run CLI
npm start scan ./example/sample-project

# 4. Start web UI (terminal 1)
npm run web

# 5. Start frontend (terminal 2, in web/ directory)
cd web && npm start
```

## 📚 Documentation

- **README.md** - Feature overview, usage examples, architecture
- **INSTALLATION.md** - Detailed setup instructions, troubleshooting
- **Source Code** - Well-commented TypeScript files

## 🔧 Development

```bash
npm run dev       # Run in development mode
npm run build     # Compile TypeScript
npm run lint      # Run linter
npm run format    # Format code with Prettier
npm test          # Run tests
```

## 📦 Distribution

After building, all files are in `dist/` directory:
- Can be packaged for npm
- Can be used in other Node projects
- Can be built as standalone CLI tool

## 🎯 Next Steps

1. Run `npm install` to install dependencies
2. Run `npm run build` to compile TypeScript
3. Run `npm start scan ./example/sample-project` to see it in action
4. Read `README.md` for comprehensive documentation
5. Explore source files for implementation details

---

**Built with TypeScript, Babel, and modern Node.js practices**
