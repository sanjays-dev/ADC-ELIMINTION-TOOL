# ADC Tool Commands Cheat Sheet

Use these commands from the project root.

## 1) Install
```bash
npm install
```

## 2) Quick Help
```bash
npm run help
```

## 3) Scan Commands
```bash
# Generic (pass your folder)
npm run scan -- ./your-project

# Example on current folder
npm run scan -- .

# Easiest (no path needed)
npm run scan:here

# Scan + AI explain immediately after analysis
node cli.js scan ./your-project --ai-explain

# Scan + AI explain with key passed directly
node cli.js scan ./your-project --ai-explain --ai-api-key YOUR_KEY

# Scan + AI explain with custom endpoint
node cli.js scan ./your-project --ai-explain --ai-api-key YOUR_KEY --ai-base-url https://api.openai.com/v1/responses
```

## 4) Report Commands
```bash
# Generic report
npm run report -- ./your-project --output report.json --format json

# Example report on current folder
npm run report -- . --output report.json --format json

# Easiest (no path needed)
npm run report:here

# Report + AI explain immediately after analysis
node cli.js report ./your-project --output report.json --format json --ai-explain

# Report + AI explain with key passed directly
node cli.js report ./your-project --output report.json --format json --ai-explain --ai-api-key YOUR_KEY
```

## 5) Clean Commands
```bash
# Generic clean (asks confirmation unless --force is passed)
npm run clean -- ./your-project --confidence 85

# Same as clean, but easier name
npm run fix -- ./your-project --confidence 85

# Confidence is a minimum threshold:
# - Higher (e.g., 80) = fewer deletions, only items scored >= 80
# - 0 = delete all detected unused items

# Remove all detected items in one command (single run)
npm run clean -- ./your-project --confidence 0 --force
npm run fix -- ./your-project --confidence 0 --force

# Easiest (no path needed) - runs on current folder
npm run clean:here
npm run clean:all:here

# Pass extra args to npm script (IMPORTANT: use --)
npm run clean:here -- --confidence 75 --force

# AI explanations for why code was removed
node cli.js clean ./your-project --confidence 85 --force --ai-explain

# AI explanations with key passed directly (no env needed)
node cli.js clean ./your-project --confidence 85 --force --ai-explain --ai-api-key YOUR_KEY

# Save explanations to custom file
node cli.js clean ./your-project --confidence 85 --force --ai-explain --explain-output cleanup-explanations.json

# Use Hugging Face provider (working hf-inference model)
node cli.js clean ./your-project --confidence 85 --force --ai-explain --ai-provider hf --ai-model google-t5/t5-small
```

Important:
```bash
# Explanations are automatic by default now.
# Disable with: --no-ai-explain
# Require strict real-AI output with: --ai-explain-strict
```

AI setup (optional):
```bash
# Put keys in .env (auto-loaded by cli.js)
OPENAI_API_KEY=your_key_here
OPENAI_MODEL=gpt-4o-mini
HF_API_KEY=your_hf_token_here
HF_MODEL=google-t5/t5-small

# Windows PowerShell
$env:OPENAI_API_KEY="your_key_here"
$env:OPENAI_MODEL="gpt-4o-mini"

# Hugging Face (PowerShell)
$env:HF_API_KEY="your_hf_token_here"
$env:HF_MODEL="google-t5/t5-small"
```

## 6) API Server
```bash
npm run server
```

## 7) Old Direct Commands (still valid)
```bash
node cli.js scan ./your-project
node cli.js report ./your-project --output report.json
node cli.js clean ./your-project --confidence 85
node server.js
```
