# 🚀 Quick Reference - All Features

## Supported Languages
```
🟨 JavaScript   🔵 TypeScript   🐍 Python   ☕ Java   ⚫ C   ⚪ C++
```

## Basic Commands

```bash
# Scan project (shows languages detected)
node cli.js scan ./my-project

# Scan with verbose (shows files by language)
node cli.js scan ./my-project --verbose

# Generate JSON report
node cli.js report ./my-project --output report.json

# Preview code removal (requires confirmation)
node cli.js clean ./my-project --confidence 85

# Remove code (no confirmation)
node cli.js clean ./my-project --confidence 85 --force

# Test installation
node validate.js

# Run tests
node test.js
```

## Language Detection Output

```
📊 Programming Languages Detected:

  🟨 JavaScript: 20 files
  🔵 TypeScript: 15 files
  🐍 Python: 10 files
  ☕ Java: 5 files
  ⚫ C: 3 files
  ⚪ C++: 2 files
```

## Confidence Thresholds

| Language | Recommended | Range |
|----------|-----------|-------|
| JavaScript | 85% | 70-95% |
| TypeScript | 85% | 70-95% |
| Python | 80% | 60-90% |
| Java | 80% | 65-90% |
| C | 75% | 60-85% |
| C++ | 75% | 60-85% |

## File Extensions Supported

```
JavaScript:  .js  .jsx
TypeScript:  .ts  .tsx
Python:      .py
Java:        .java
C:           .c
C++:         .cpp  .cc  .cxx  .h  .hpp
```

## Examples

### Analyze Python Project
```bash
node cli.js scan ./python-project --verbose
node cli.js report ./python-project --output py-report.json
```

### Analyze C Project
```bash
node cli.js scan ./c-project --verbose
node cli.js report ./c-project --output c-report.json
```

### Analyze C++ Project
```bash
node cli.js scan ./cpp-project --verbose
node cli.js clean ./cpp-project --confidence 80
```

### Analyze Mixed Project
```bash
node cli.js scan ./monorepo --verbose
# Shows all detected languages
```

## Getting Started

```bash
# 1. Verify installation
node validate.js

# 2. Test with demo
node cli.js scan ./demo-unused-python --verbose

# 3. Analyze your project
node cli.js scan ./your-project-path

# 4. Generate report
node cli.js report ./your-project-path --output report.json
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "No source files found" | Use correct project path with source files |
| "All files failed to parse" | Check file syntax, ensure npm install ran |
| C/C++ files not detected | Verify correct file extensions (.c, .cpp, etc) |
| Too many false positives | Increase confidence threshold (e.g., 90%) |

## Documentation Files

- **C-CPP-UPDATE.md** - New features overview
- **C-CPP-SUPPORT.md** - Detailed C/C++ guide
- **QUICK-START.md** - Getting started guide
- **MULTI-LANGUAGE.md** - All language details
- **FIX-README.md** - Quick fix overview

## Terminal Icons

| Icon | Meaning |
|------|---------|
| 🔍 | Starting analysis |
| 📁 | Project path |
| ✓ | Success |
| 📊 | Language statistics |
| 🟨 | JavaScript |
| 🔵 | TypeScript |
| 🐍 | Python |
| ☕ | Java |
| ⚫ | C |
| ⚪ | C++ |
| 📝 | Parsing |
| 🔗 | Graph building |
| 🎯 | Detection |

## Usage Tips

✅ Use `--verbose` to see detailed progress  
✅ Use `--confidence 90` for safer removal  
✅ Always preview with `clean` before using `--force`  
✅ Generate reports for documentation  
✅ Test on demo first, then your code  

---

**Ready to use**: `node cli.js scan . --verbose`
