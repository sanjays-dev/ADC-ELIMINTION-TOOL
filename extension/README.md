# Automated Dead Code Eliminator

Automated Dead Code Eliminator is a VS Code extension that integrates your existing static dead-code analysis engine and exposes it through diagnostics, command palette commands, and safe quick fixes.

## Features

- Dead code analysis for JavaScript, TypeScript, JSX, and TSX.
- VS Code diagnostics in editor and Problems panel.
- Quick Fix actions for safely removable findings.
- Workspace-wide and current-file analysis commands.
- Optional analyze-on-save behavior.
- Safe edit application with explicit user confirmation.

## Supported Languages

- JavaScript
- TypeScript
- JSX (javascriptreact)
- TSX (typescriptreact)

## Installation

Install from a packaged VSIX:

```bash
code --install-extension automated-dead-code-eliminator-1.0.0.vsix
```

## Usage

1. Open a JavaScript/TypeScript workspace.
2. Run a command from the Command Palette:
	- Dead Code: Analyze Current File
	- Dead Code: Analyze Workspace
3. Open Problems panel to review findings.
4. Use Quick Fix on a diagnostic to apply safe removals.
5. Use Dead Code: Remove Safe Dead Code to apply all safe findings after confirmation.

## Commands

- Dead Code: Analyze Current File
- Dead Code: Analyze Workspace
- Dead Code: Remove Safe Dead Code
- Dead Code: Clear Diagnostics

## Quick Fix Behavior

Quick Fixes are offered only when removal is marked safe by the analyzer adapter.
The extension never auto-deletes code without user confirmation.

## Configuration

Settings are available under `deadCodeEliminator`:

- `deadCodeEliminator.enable` (default: true)
- `deadCodeEliminator.analyzeOnSave` (default: true)
- `deadCodeEliminator.minConfidence` (default: 85)
- `deadCodeEliminator.maxFileSizeKB` (default: 1024)

## Example

Before:

```ts
import fs from 'fs';

function unusedFunction() {
  return 1;
}

const used = 10;
console.log(used);
```

After applying safe fixes:

```ts
const used = 10;
console.log(used);
```

## Limitations

- This extension performs static analysis and may produce conservative findings.
- Automatic removals are line-range based and only available when safety checks pass.
- Complex multi-symbol declarations may require manual review.

## Architecture Overview

Two-layer architecture:

1. Core analysis engine (existing project logic)
	- Parser
	- Dependency graph builder
	- Reachability analyzer
	- Dead code detector
	- Confidence scoring

2. VS Code extension layer
	- Diagnostic provider
	- Code action provider
	- Commands and settings
	- Safe WorkspaceEdit application

## Development

From the `extension` directory:

```bash
npm install
npm run compile
```

## Testing

```bash
npm test
npm run test:integration
npm run test:all
```

Tests cover:

- Unused variable detection
- Unused function detection
- Unused import detection
- Unreachable code detection
- Safe removal planning
- Diagnostic mapping
- Quick fix metadata
- Invalid syntax handling
- JavaScript support
- TypeScript support

Integration harness covers:

- Running commands in Extension Development Host
- Live diagnostics publication
- Quick Fix generation and WorkspaceEdit application

## Packaging

```bash
npm run compile
npm test
npx vsce package
```

Expected output:

`automated-dead-code-eliminator-1.0.0.vsix`

## Marketplace Publishing

1. Set your publisher in `package.json`.
2. Create/publish publisher in VS Code Marketplace.
3. Login with `vsce login <publisher>`.
4. Publish with `vsce publish`.

## Security Note

The extension runs analysis locally and does not execute project source code or upload user code to external services.
