# System Architecture

## Overview

The Automated Dead Code Elimination Tool (ADC) is built using a modular, layered architecture designed for extensibility, maintainability, and performance.

```
┌─────────────────────────────────────────────────────────┐
│                   CLI / Web UI Layer                    │
│              (User Interaction & Presentation)          │
├─────────────────────────────────────────────────────────┤
│                 Analysis Engine Layer                   │
│            (Orchestration & Coordination)               │
├─────────────────────┬──────────────────┬────────────────┤
│  Core Analysis      │  Graph Building  │  Code Removal  │
│  - Parser           │  - Graph Builder │  - Cleaner     │
│  - Detector         │  - Analyzer      │  - Proposals   │
├─────────────────────┴──────────────────┴────────────────┤
│                   Utilities Layer                       │
│         (AST Utilities, File I/O, Helpers)             │
└─────────────────────────────────────────────────────────┘
```

---

## Module Breakdown

### 1. Parser Module (`parser.ts`)

**Purpose:** Convert source files to Abstract Syntax Trees (AST)

**Key Components:**
- Babel Parser integration
- Error handling and recovery
- Support for modern JS/TS syntax

**Flow:**
```
Source File → Babel Parser → AST Node Tree
```

**Configuration:**
- Supports TypeScript, JSX, modern syntax
- Handles decorators, optional chaining, etc.
- Graceful error handling for syntax errors

**Output:**
```typescript
interface ParsedFile {
  filePath: string;
  ast: ASTNode | null;
  content: string;
  error?: string;
}
```

---

### 2. Graph Builder Module (`graphBuilder.ts`)

**Purpose:** Build a semantic dependency graph from AST nodes

**Key Concepts:**

#### Nodes
- Functions (FunctionDeclaration, ArrowFunction)
- Variables (VariableDeclaration, const/let/var)
- Classes (ClassDeclaration)
- Imports (ImportDeclaration specifiers)
- Exports (ExportNamedDeclaration, ExportDefaultDeclaration)
- Modules (file-level entities)

#### Edges
- **call** - Function calls
- **import** - Import relationships
- **reference** - Variable/property references
- **dependency** - Module dependencies

**Algorithm:**
```
1. Walk AST for each file
2. Extract all declarations (functions, variables, classes)
3. Record locations (file, line, column)
4. Build import relationships
5. Connect call expressions to function definitions
```

**Node ID Schema:**
```
{normalized_file_path}:{symbol_name}:{line_number}
```

Example: `src/utils.ts:calculateTotal:45`

---

### 3. Analyzer Module (`analyzer.ts`)

**Purpose:** Determine code reachability using graph traversal

**Algorithm:** Depth-First Search (DFS)

```
Entry Points → DFS Traversal → Reachable Set
                                ↓
                           Unreachable Set (inverse)
```

**Steps:**
1. Identify entry points (main files, exports)
2. Initialize frontier with entry point nodes
3. DFS traversal:
   - Visit node (mark as reachable)
   - Explore all outgoing edges
   - Recursively visit adjacent nodes
4. Mark unvisited nodes as unreachable
5. Special handling for:
   - Exported symbols (always reachable)
   - Circular dependencies
   - Dynamic code (flagged but included)

**Complexity:** O(V + E) where V = nodes, E = edges

---

### 4. Detector Module (`detector.ts`)

**Purpose:** Classify dead code and assign confidence scores

**Classification Logic:**

```
Unreachable Node
    ↓
Type Check (function/variable/import/etc)
    ↓
Confidence Calculation
    ├─ Base Score (type-dependent)
    ├─ Dynamic Flag (-40 if dynamic)
    └─ Export Status (adjustment if exported)
    ↓
Final Score (0-100%)
```

**Scoring Rules:**

| Type | Base Score | Notes |
|------|-----------|-------|
| Unused Function | 90 | -40 if dynamic |
| Unused Variable | 85 | -40 if dynamic |
| Unused Import | 95 | -40 if dynamic |
| Unreachable Code | 88 | -40 if dynamic |

**Dynamic Code Detection:**
- Flags `eval()` calls
- Dynamic `require()` patterns
- Dynamic imports
- String-based function calls

---

### 5. Reporter Module (`reporter.ts`)

**Purpose:** Generate human-readable and machine-readable reports

**Output Formats:**

#### Console Output
- Color-coded severity levels
- Grouped by file
- Summary statistics
- Code snippets

#### JSON Output
- Machine-readable format
- Complete dead code list
- Metadata and timestamps
- Suitable for CI/CD integration

**Report Structure:**
```typescript
{
  projectPath: string
  scanDate: string
  totalFiles: number
  totalNodes: number
  deadCodeItems: DeadCodeItem[]
  totalDeadCodeLines: number
  codeReductionPercentage: number
  confidenceScore: number
  summary: {
    totalDeadFunctions: number
    totalDeadVariables: number
    totalUnusedImports: number
    totalUnreachableFiles: number
  }
}
```

---

### 6. Cleaner Module (`cleaner.ts`)

**Purpose:** Safely propose and execute code removal

**Workflow:**

```
Dead Code Items
    ↓
Generate Proposal
    ├─ Safe to Delete (confidence >= 85)
    ├─ Uncertain (confidence < 85)
    └─ Preview
    ↓
[Optional] Review & Confirm
    ↓
Remove Code
    ├─ Group by file
    ├─ Remove lines
    └─ Write back
    ↓
Result Report
```

**Safety Features:**
- Confidence-based filtering
- Preview generation
- User confirmation (CLI)
- Git diff generation
- File backup potential

---

### 7. Analysis Engine (`engine.ts`)

**Purpose:** Orchestrate the entire analysis workflow

**Main Flow:**

```
1. Find all source files
2. Parse files to AST
3. Build dependency graph
4. Detect entry points
5. Run reachability analysis
6. Detect dead code
7. Calculate statistics
8. Generate report
```

**Responsibilities:**
- Coordinate module interactions
- Handle errors
- Collect statistics
- Create final report

---

### 8. CLI Interface (`cli.ts`)

**Purpose:** Provide command-line interface

**Commands:**
- `scan` - Analyze project
- `report` - Generate detailed report
- `clean` - Remove code safely

**Features:**
- Argument parsing via Commander.js
- Interactive prompts for confirmation
- Progress indication
- Error handling and reporting

---

### 9. Web Server (`server.ts`)

**Purpose:** REST API for web UI

**Endpoints:**
- `POST /api/scan` - Start scan
- `GET /api/report/:id` - Retrieve report
- `POST /api/cleanup-proposal` - Generate proposal
- `POST /api/cleanup-execute` - Execute cleanup
- `GET /api/report/:id/export` - Export report

**Features:**
- CORS enabled
- JSON request/response
- In-memory caching
- Error handling

---

## Data Flow Diagram

```
┌─────────────────┐
│  Project Files  │
└────────┬────────┘
         │
         ▼
    ┌─────────────────┐
    │  Parser Module  │
    │ (Babel Parser)  │
    └────────┬────────┘
             │ [ParsedFile[]]
             ▼
    ┌─────────────────────┐
    │  Graph Builder      │
    │  - Extract Nodes    │
    │  - Build Edges      │
    └────────┬────────────┘
             │ [DependencyGraph]
             ▼
    ┌──────────────────────┐
    │  Analyzer            │
    │  - DFS Traversal     │
    │  - Find Reachability │
    └────────┬─────────────┘
             │ [Reachable/Unreachable Sets]
             ▼
    ┌──────────────────────┐
    │  Detector            │
    │  - Classify Dead Code│
    │  - Score Confidence  │
    └────────┬─────────────┘
             │ [DeadCodeItem[]]
             ▼
    ┌──────────────────────┐
    │  Reporter            │
    │  - Format Output     │
    │  - Generate Report   │
    └────────┬─────────────┘
             │ [AnalysisReport]
             ▼
    ┌──────────────────────┐
    │  Output              │
    │  - Console/JSON      │
    │  - Web UI            │
    │  - File Export       │
    └──────────────────────┘
```

---

## Algorithm Details

### DFS Reachability Analysis

```typescript
function dfs(nodeId: string, adjacencyList: Map, visited: Set) {
  if (visited.has(nodeId)) return;
  
  visited.add(nodeId);
  
  for (let neighbor of adjacencyList.get(nodeId) || []) {
    dfs(neighbor, adjacencyList, visited);
  }
}

function analyze() {
  for (let entryPoint of entryPoints) {
    dfs(entryPoint, adjacencyList, visited);
  }
  
  unreachable = allNodes - visited;
}
```

**Complexity:**
- Time: O(V + E)
- Space: O(V)
- V = number of nodes
- E = number of edges

---

## Confidence Score Calculation

### Formula

```
Base Score = type_specific_score
If dynamic code detected: score = max(30, score - 40)
If exported: score = score - 5
Final Score = clamp(score, 0, 100)
```

### Type-Specific Scores

- **Unused Import**: 95 (very specific - clear dead code)
- **Unused Function**: 90 (clearly dead if not called)
- **Unused Variable**: 85 (could be side effects)
- **Unreachable Code**: 88 (standard unreachable)

### Dynamic Code Adjustment

Detects and flags as uncertain:
- `eval()` calls
- Dynamic `require(variableName)`
- String-based function invocations
- Reflection patterns

---

## Performance Optimizations

### 1. Lazy Loading
- AST generated on-demand
- Files parsed independently
- Parallel parsing potential

### 2. Graph Caching
- Nodes indexed by ID
- Adjacency list precomputed
- Reused for multiple queries

### 3. Early Exit
- Analysis stops for unreachable nodes
- No backtracking needed
- Efficient single pass

### 4. Memory Management
- Streaming file reads
- Limited AST retention
- Garbage collection friendly

---

## Extension Points

### Adding New File Types

Modify `parser.ts`:
```typescript
const BABEL_OPTIONS = {
  plugins: [
    'typescript',     // Add new language support
    'flow',
    'jsx',
    // new plugins here
  ]
};
```

### Custom Dead Code Rules

Extend `detector.ts`:
```typescript
private classifyDeadCode(node: GraphNode): DeadCodeItem {
  // Add custom classification logic
  if (node.hasCustomAttribute) {
    // Handle custom case
  }
}
```

### Custom Entry Point Detection

Modify `engine.ts`:
```typescript
private findEntryPoints(files: string[]): string[] {
  // Add custom entry point logic
  // e.g., check package.json main field
  // check for script files
}
```

---

## Error Handling Strategy

### Parse Errors
- File-level error handling
- Continue with other files
- Report parse failures in output

### Analysis Errors
- Catch and log exceptions
- Provide partial results if possible
- Exit gracefully

### File System Errors
- Handle missing files
- Permission errors
- I/O exceptions

---

## Testing Strategy

### Unit Tests
- Individual module testing
- Mock AST nodes
- Test classification logic

### Integration Tests
- End-to-end analysis
- Real project scanning
- Report generation

### Regression Tests
- Track known false positives
- Ensure fixes don't reoccur
- CI/CD integration

---

## Future Enhancements

### Phase 2
- [ ] Multi-language support (Python, Java)
- [ ] Machine learning for confidence scoring
- [ ] Real-time file watching
- [ ] Incremental analysis

### Phase 3
- [ ] VS Code extension
- [ ] IntelliJ plugin
- [ ] CI/CD pipeline integration
- [ ] Cloud-based analysis

### Phase 4
- [ ] IDE integration (all major IDEs)
- [ ] Advanced visualization (graph rendering)
- [ ] Predictive analysis
- [ ] AI-powered recommendations

---

## Performance Benchmarks

Test on various project sizes:

| Project Size | Files | Analysis Time | Memory |
|-------------|-------|----------------|--------|
| Small | 10-50 | 0.5-1s | 50MB |
| Medium | 50-500 | 2-5s | 150MB |
| Large | 500-2000 | 10-30s | 500MB |
| Enterprise | 2000+ | 60-300s | 1GB+ |

---

For implementation details, see the source code with inline comments.
