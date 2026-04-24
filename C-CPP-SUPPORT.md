# C/C++ Support & Language Detection Guide

## What's New

✅ **C Language Support** (.c files)  
✅ **C++ Language Support** (.cpp, .cc, .cxx, .h, .hpp files)  
✅ **Language Detection Display** - Shows all detected programming languages before analysis starts  

## Supported Languages

| Language | Extensions | Parser Type | Status |
|----------|-----------|------------|--------|
| JavaScript | .js, .jsx | Babel AST | ✅ Full |
| TypeScript | .ts, .tsx | Babel AST | ✅ Full |
| Python | .py | Regex-based | ✅ Full |
| Java | .java | Regex-based | ✅ Full |
| **C** | **.c** | **Regex-based** | **✅ NEW** |
| **C++** | **.cpp, .cc, .cxx, .h, .hpp** | **Regex-based** | **✅ NEW** |

## Language Detection Output

When you run analysis, the tool now shows all detected programming languages **BEFORE** starting the analysis:

```bash
$ node cli.js scan ./my-project

🔍 Starting Analysis...

════════════════════════════════════════════════════════════════
📁 Project: C:\projects\my-project
✓ Found 45 source files

📊 Programming Languages Detected:

  🟨 JavaScript: 15 files
  🔵 TypeScript: 8 files
  🐍 Python: 12 files
  ☕ Java: 5 files
  ⚫ C: 3 files
  ⚪ C++: 2 files

════════════════════════════════════════════════════════════════

📝 Parsing files...
✓ Successfully parsed 45/45 files
```

## C Language Support

### What's Detected
- ✅ Function definitions
- ✅ Global variables
- ✅ Struct definitions
- ✅ Include statements
- ✅ Enum definitions

### C Parser Example
```c
// Input
#include <stdio.h>

void print_message(char* msg) {
    printf("%s\n", msg);
}

struct Point {
    int x, y;
};

int unused_var = 42;

// Detected Items
- FunctionDeclaration: print_message
- IncludeDeclaration: stdio.h
- StructDeclaration: Point
- VariableDeclaration: unused_var
```

### Usage
```bash
# Analyze C project
node cli.js scan ./c-project --verbose

# Generate C analysis report
node cli.js report ./c-project --output c-analysis.json

# Preview code removal
node cli.js clean ./c-project --confidence 85
```

## C++ Language Support

### What's Detected
- ✅ Function definitions
- ✅ Class definitions
- ✅ Struct definitions
- ✅ Include statements
- ✅ Variable declarations
- ✅ Namespaces (basic)

### C++ Parser Example
```cpp
// Input
#include <iostream>
#include <vector>

class DataProcessor {
    void process_data(std::vector<int>& data);
    std::string unused_method();
};

int global_counter = 0;

// Detected Items
- IncludeDeclaration: iostream
- IncludeDeclaration: vector
- ClassDeclaration: DataProcessor
- FunctionDeclaration: process_data
- FunctionDeclaration: unused_method
- VariableDeclaration: global_counter
```

### Usage
```bash
# Analyze C++ project
node cli.js scan ./cpp-project --verbose

# Generate C++ analysis report
node cli.js report ./cpp-project --output cpp-analysis.json

# Preview code removal
node cli.js clean ./cpp-project --confidence 80
```

## Language Detection Output Format

When using `--verbose` flag, each language shows:
1. **File count** with icon
2. **Sample files** (first 3)
3. **Remaining count** if more than 3

Example:
```
📊 Programming Languages Detected:

  🟨 JavaScript: 20 files
    • src/app.js
    • src/utils.js
    • src/config.js
    ... and 17 more
  
  🔵 TypeScript: 15 files
    • src/types/index.ts
    • src/services/api.ts
    • src/components/App.tsx
    ... and 12 more
  
  🐍 Python: 8 files
    • scripts/deploy.py
    • scripts/test.py
    • utils/helper.py
    ... and 5 more
```

## Examples

### Mixed Language Project
```bash
$ node cli.js scan ./monorepo --verbose

📊 Programming Languages Detected:

  🟨 JavaScript: 45 files
  🔵 TypeScript: 32 files
  🐍 Python: 18 files
  ☕ Java: 12 files
  ⚫ C: 8 files
  ⚪ C++: 5 files
```

### C Only Project
```bash
$ node cli.js scan ./c-library

📊 Programming Languages Detected:

  ⚫ C: 24 files

Analyzing C code...
```

### C++ Only Project
```bash
$ node cli.js scan ./cpp-application

📊 Programming Languages Detected:

  ⚪ C++: 42 files

Analyzing C++ code...
```

## C/C++ Parser Limitations

### What Works Well
- ✅ Function definitions (most patterns)
- ✅ Class/struct declarations
- ✅ Include directives
- ✅ Global variables
- ✅ Basic enum detection

### What Doesn't Work (Limitations)
- ❌ Templates (C++ templates are complex)
- ❌ Macros (preprocessor directives)
- ❌ Function pointers (may be detected as variables)
- ❌ Lambda expressions (may be detected as functions)
- ❌ Complex type definitions
- ❌ Forward declarations analysis

### Confidence Scores for C/C++
- Include unused: 90-95% confidence
- Function unused: 60-70% confidence (may have false positives)
- Class/struct unused: 65-75% confidence
- Variable unused: 50-60% confidence (high false positive rate)

## Recommended Thresholds

| Language | Recommended | Aggressive | Conservative |
|----------|------------|-----------|--------------|
| JavaScript | 85% | 70% | 95% |
| TypeScript | 85% | 70% | 95% |
| Python | 80% | 60% | 90% |
| Java | 80% | 65% | 90% |
| **C** | **75%** | **60%** | **85%** |
| **C++** | **75%** | **60%** | **85%** |

## Complete Language Reference

```bash
# All supported file types
Extensions: .js, .jsx, .ts, .tsx, .py, .java, .c, .cpp, .cc, .cxx, .h, .hpp

# Scan all language types
node cli.js scan ./mixed-project

# C/C++ specific
node cli.js scan ./c-src        # C files
node cli.js scan ./cpp-src      # C++ files

# Generate multilingual report
node cli.js report ./monorepo --output full-analysis.json

# Analyze with language awareness
node cli.js clean ./project --confidence 80 --verbose
# Shows which languages are being processed
```

## Testing C/C++ Support

### Create Test Files
```c
// test.c
#include <stdio.h>

void used_function() {
    printf("Hello\n");
}

void unused_function() {
    printf("Never called\n");
}

int unused_var = 42;
```

### Run Analysis
```bash
# Create a test directory
mkdir c-test
cd c-test
# Create test.c with above content

# Analyze
node cli.js scan . --verbose
```

### Expected Output
```
📊 Programming Languages Detected:

  ⚫ C: 1 file

📝 Parsing files...
✓ Successfully parsed 1/1 files

Dead Code Detected:
- unused_function
- unused_var
```

## Performance Notes

### Parsing Speed
- **JavaScript/TypeScript**: 10-50ms per file (full AST)
- **Python/Java**: 2-5ms per file (regex)
- **C/C++**: 3-8ms per file (regex)

### Typical Project Times
- 100 mixed files: 2-10 seconds
- 500 mixed files: 10-60 seconds
- 1000+ mixed files: 1-3 minutes

## Troubleshooting

### Issue: C/C++ files not being analyzed
**Solution**: Ensure files have correct extensions (.c, .cpp, .cc, .cxx, .h, .hpp)

### Issue: High false positive rate for C/C++
**Solution**: Use higher confidence threshold (e.g., 85-90% instead of 75%)

### Issue: Function detection seems off
**Solution**: This is normal for C/C++ regex-based parser. Functions with complex signatures may be missed or misidentified.

## Integration with CI/CD

```bash
# Example GitHub Actions
- name: Scan for dead code
  run: |
    node cli.js scan ./src --verbose
    node cli.js report ./src --output dead-code-report.json

- name: Upload report
  uses: actions/upload-artifact@v2
  with:
    name: dead-code-analysis
    path: dead-code-report.json
```

## Next Steps

1. **Test with your C/C++ code**:
   ```bash
   node cli.js scan ./your-c-project --verbose
   ```

2. **Generate a report**:
   ```bash
   node cli.js report ./your-c-project --output report.json
   ```

3. **Review results**:
   ```bash
   # The report shows which items are detected as unused
   cat report.json
   ```

4. **Preview removal** (without actually removing):
   ```bash
   node cli.js clean ./your-c-project --confidence 80
   # Press 'no' to cancel
   ```

---

**Status**: ✅ **C/C++ Support Active**  
**Language Detection**: ✅ **Enabled**  
**Supported Languages**: JavaScript, TypeScript, Python, Java, C, C++  
**Ready to use**: ✅ **YES**
