#!/usr/bin/env node
/**
 * CLI Interface
 */

const { Command } = require('commander');
const chalk = require('chalk');
const { AnalysisEngine } = require('./engine');
const { CodeCleaner } = require('./cleaner');
const { AiExplainer } = require('./aiExplainer');
const { enrichWithImpact } = require('./impactAnalyzer');
const readline = require('readline');
const path = require('path');
const fs = require('fs');
const { getProjectSizeBytes } = require('./fileUtils');

loadDotEnvIfPresent();

const program = new Command();

program
  .name('adc-scan')
  .description('Automated Dead Code Elimination Tool - Detect and remove unused code')
  .version('1.0.0');

program
  .command('scan <projectPath>')
  .description('Scan a project for dead code')
  .option('-o, --output <file>', 'Output report file')
  .option('-f, --format <format>', 'Output format: json or console', 'console')
  .option('-e, --entryPoints <points...>', 'Entry point files')
  .option('-v, --verbose', 'Verbose output')
  .option('--ai-explain', 'Enable automatic explanation text for detected dead code')
  .option('--no-ai-explain', 'Disable automatic explanation text for detected dead code')
  .option('--ai-explain-strict', 'Fail if real AI explanations cannot be generated')
  .option('--ai-provider <provider>', 'AI provider: openai or hf', process.env.AI_PROVIDER || 'openai')
  .option('--ai-model <model>', 'Model for AI explanations (default based on provider)')
  .option('--ai-api-key <key>', 'API key for selected AI provider (overrides env)')
  .option('--ai-base-url <url>', 'Custom AI endpoint URL (overrides provider default)')
  .option('--explain-output <file>', 'Write explanations to a JSON file')
  .action(async (projectPath, options) => {
    try {
      const engine = new AnalysisEngine();
      console.log(chalk.bold.cyan('\nStarting Dead Code Analysis...\n'));
      const report = await engine.analyze({
        projectPath,
        entryPoints: options.entryPoints,
        verbose: options.verbose,
      });
      await maybeExplainDeadCode(report, options, 'scan-explanations.json');

      console.log(engine.generateReport(report, 'console'));

      if (options.output) {
        const outputPath = path.resolve(options.output);
        const format = options.format === 'json' ? 'json' : 'console';
        if (engine.saveReport(report, outputPath, format)) {
          console.log(chalk.green(`Report saved to: ${outputPath}\n`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Error during analysis:'), error.message);
      process.exit(1);
    }
  });

program
  .command('clean <projectPath>')
  .description('Remove dead code safely (with confirmation)')
  .option('-f, --force', 'Skip confirmation prompts')
  .option('--allow-self-clean', 'Allow cleaning the tool root itself')
  .option('--confidence <score>', 'Minimum confidence score (0-100)', '85')
  .option('--ai-explain', 'Generate explanation text for removed items (optional)')
  .option('--no-ai-explain', 'Disable automatic explanation text for removed items')
  .option('--ai-explain-strict', 'Fail if real AI explanations cannot be generated')
  .option('--ai-provider <provider>', 'AI provider: openai or hf', process.env.AI_PROVIDER || 'openai')
  .option('--ai-model <model>', 'Model for AI explanations (default: gpt-4o-mini)')
  .option('--ai-api-key <key>', 'API key for selected AI provider (overrides env)')
  .option('--ai-base-url <url>', 'Custom AI endpoint URL (overrides provider default)')
  .option('--explain-output <file>', 'Write explanations to a JSON file')
  .action(async (projectPath, options) => {
    try {
      const resolvedProject = path.resolve(projectPath);
      const rootCli = path.resolve(process.cwd(), 'cli.js');
      const rootPackage = path.resolve(process.cwd(), 'package.json');
      const looksLikeToolRoot = resolvedProject === process.cwd() && fs.existsSync(rootCli) && fs.existsSync(rootPackage);

      if (looksLikeToolRoot && !options.allowSelfClean) {
        console.log(
          chalk.yellow(
            'Safety stop: refusing to clean the tool root "." because this can break the CLI.\n' +
              'Use a subfolder (example: ./demo-js) or add --allow-self-clean if you really want this.\n'
          )
        );
        return;
      }

      const engine = new AnalysisEngine();
      const cleaner = new CodeCleaner();

      console.log(chalk.bold.cyan('\nStarting Safe Code Removal...\n'));
      const minConfidence = Number.parseInt(options.confidence, 10);
      const report = await engine.analyze({
        projectPath: resolvedProject,
        minConfidence: Number.isNaN(minConfidence) ? 85 : minConfidence,
      });
      const projectSizeBefore = getProjectSizeBytes(resolvedProject);

      let safeCode = report.deadCodeItems.filter(item => item.confidenceScore >= minConfidence);
      if (safeCode.length === 0) {
        console.log(chalk.yellow('No dead code found with the specified confidence level.\n'));
        console.log(renderSizeReductionReport(projectSizeBefore, projectSizeBefore));
        return;
      }

      safeCode = enrichWithImpact(safeCode, {
        projectPath: resolvedProject,
        entryPoints: report.entryPoints,
      });

      if (shouldExplainOnClean(options)) {
        console.log(chalk.blue('Generating explanations for removals...'));
        const explainer = new AiExplainer({
          provider: options.aiProvider,
          model: options.aiModel,
          apiKey: options.aiApiKey,
          baseUrl: options.aiBaseUrl,
        });
        safeCode = await explainer.explainItems(safeCode);
        if (options.aiExplainStrict) {
          enforceRequiredAiExplanations(explainer, options.aiProvider);
        }
        logAiFallbackHintIfNeeded(explainer, options.aiProvider);
        logAiFailureHintIfNeeded(explainer);

        if (options.explainOutput) {
          const explanationPath = path.resolve(options.explainOutput);
          saveExplanations(explanationPath, resolvedProject, safeCode);
          console.log(chalk.green(`Saved explanations to: ${explanationPath}`));
        }
      }

      const proposal = cleaner.generateDeletionProposal(safeCode, {
        projectPath: resolvedProject,
      });
      console.log(cleaner.previewChanges(proposal));
      console.log(cleaner.buildLiveRefactoringPreview(proposal));

      if (!options.force) {
        const confirmed = await askConfirmation('Proceed with removal?');
        if (!confirmed) {
          console.log(chalk.yellow('Cleanup cancelled.\n'));
          console.log(renderSizeReductionReport(projectSizeBefore, projectSizeBefore));
          return;
        }
      }

      console.log('\nRemoving dead code...');
      const result = cleaner.removeDeadCode(proposal.safeToDelete);
      const projectSizeAfter = getProjectSizeBytes(resolvedProject);
      console.log(chalk.green(`Successfully removed ${result.removed} items`));
      if (result.failed > 0) {
        console.log(chalk.yellow(`Failed to remove ${result.failed} items`));
      }
      console.log(renderSizeReductionReport(projectSizeBefore, projectSizeAfter));
      console.log('');
    } catch (error) {
      console.error(chalk.red('Error during cleanup:'), error.message);
      process.exit(1);
    }
  });

program
  .command('report <projectPath>')
  .description('Generate a detailed analysis report')
  .option('-o, --output <file>', 'Output report file (default: adc-report.json)')
  .option('-f, --format <format>', 'Output format: json or console', 'json')
  .option('--ai-explain', 'Enable automatic explanation text for detected dead code')
  .option('--no-ai-explain', 'Disable automatic explanation text for detected dead code')
  .option('--ai-explain-strict', 'Fail if real AI explanations cannot be generated')
  .option('--ai-provider <provider>', 'AI provider: openai or hf', process.env.AI_PROVIDER || 'openai')
  .option('--ai-model <model>', 'Model for AI explanations (default based on provider)')
  .option('--ai-api-key <key>', 'API key for selected AI provider (overrides env)')
  .option('--ai-base-url <url>', 'Custom AI endpoint URL (overrides provider default)')
  .option('--explain-output <file>', 'Write explanations to a JSON file')
  .action(async (projectPath, options) => {
    try {
      const engine = new AnalysisEngine();
      console.log(chalk.bold.cyan('\nGenerating Analysis Report...\n'));
      const report = await engine.analyze({ projectPath });
      await maybeExplainDeadCode(report, options, 'report-explanations.json');
      const outputPath = path.resolve(options.output || 'adc-report.json');
      if (engine.saveReport(report, outputPath, options.format)) {
        console.log(chalk.green(`Report saved to: ${outputPath}\n`));
      }
    } catch (error) {
      console.error(chalk.red('Error generating report:'), error.message);
      process.exit(1);
    }
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.outputHelp();
}

function askConfirmation(question) {
  return new Promise(resolve => {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    rl.question(chalk.yellow(`\n${question} (yes/no): `), answer => {
      rl.close();
      const normalized = String(answer || '').trim().toLowerCase();
      resolve(normalized === 'yes' || normalized === 'y');
    });
  });
}

async function maybeExplainDeadCode(report, options, defaultFileName) {
  if (options.aiExplain === false) return;
  if (!report || !Array.isArray(report.deadCodeItems) || report.deadCodeItems.length === 0) return;

  console.log(chalk.blue('Generating explanations for detected dead code...'));
  const explainer = new AiExplainer({
    provider: options.aiProvider,
    model: options.aiModel,
    apiKey: options.aiApiKey,
    baseUrl: options.aiBaseUrl,
  });
  report.deadCodeItems = await explainer.explainItems(report.deadCodeItems);
  if (options.aiExplainStrict) {
    enforceRequiredAiExplanations(explainer, options.aiProvider);
  }
  logAiFallbackHintIfNeeded(explainer, options.aiProvider);
  logAiFailureHintIfNeeded(explainer);

  if (options.explainOutput) {
    const explanationPath = path.resolve(options.explainOutput || defaultFileName);
    saveExplanations(explanationPath, report.projectPath || process.cwd(), report.deadCodeItems);
    console.log(chalk.green(`Saved explanations to: ${explanationPath}`));
  }
}

function logAiFallbackHintIfNeeded(explainer, providerInput) {
  if (explainer.isEnabled()) return;
  const provider = String(providerInput || 'openai').toLowerCase();
  const keyHint =
    provider === 'hf' || provider === 'huggingface'
      ? 'HF_API_KEY (or HUGGINGFACE_API_KEY)'
      : 'OPENAI_API_KEY';
  console.log(chalk.yellow(`${keyHint} not found. Using built-in fallback explanations.`));
}

function logAiFailureHintIfNeeded(explainer) {
  if (!explainer || typeof explainer.hasAiFailures !== 'function' || !explainer.hasAiFailures()) return;
  const details = typeof explainer.getLastAiError === 'function' ? explainer.getLastAiError() : '';
  const suffix = details ? ` Last error: ${details}` : '';
  console.log(chalk.yellow(`AI request failed; fallback explanations were used.${suffix}`));
}

function saveExplanations(filePath, projectPath, items) {
  const payload = {
    createdAt: new Date().toISOString(),
    projectPath,
    items: items.map(item => ({
      name: item.name,
      type: item.type,
      filePath: item.filePath,
      line: item.location ? item.location.line : item.line || 1,
      confidenceScore: item.confidenceScore,
      explanation: item.explanation || '',
    })),
  };
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf-8');
}

function renderSizeReductionReport(beforeBytes, afterBytes) {
  const before = Number.isFinite(beforeBytes) ? beforeBytes : 0;
  const after = Number.isFinite(afterBytes) ? afterBytes : 0;
  const reduction = Math.max(0, before - after);
  const reductionPct = before > 0 ? (reduction / before) * 100 : 0;

  return [
    '\nPROJECT SIZE REDUCTION REPORT',
    `Before: ${formatKb(before)}`,
    `After: ${formatKb(after)}`,
    `Improvement: ${reductionPct.toFixed(2)}% reduction`,
  ].join('\n');
}

function formatKb(bytes) {
  const kb = bytes / 1024;
  if (kb >= 1) return `${Math.round(kb)} KB`;
  return `${kb.toFixed(2)} KB`;
}

function shouldExplainOnClean(options) {
  if (!options || options.aiExplain === false) return false;
  // For clean flow, explanations are opt-in (only when explicitly requested).
  return hasCliFlag('--ai-explain');
}

function hasCliFlag(flag) {
  return Array.isArray(process.argv) && process.argv.includes(flag);
}

function enforceRequiredAiExplanations(explainer, providerInput) {
  const provider = String(providerInput || 'openai').toLowerCase();
  const keyHint =
    provider === 'hf' || provider === 'huggingface'
      ? 'HF_API_KEY (or HUGGINGFACE_API_KEY)'
      : 'OPENAI_API_KEY';

  if (!explainer || typeof explainer.isEnabled !== 'function' || !explainer.isEnabled()) {
    throw new Error(`${keyHint} not found. --ai-explain requires real AI explanations.`);
  }

  const fallbackCount =
    typeof explainer.getFallbackCount === 'function' ? explainer.getFallbackCount() : 0;
  const aiFailures =
    typeof explainer.hasAiFailures === 'function' ? explainer.hasAiFailures() : false;

  if (fallbackCount > 0 || aiFailures) {
    const lastError =
      typeof explainer.getLastAiError === 'function' ? explainer.getLastAiError() : '';
    const suffix = lastError ? ` Last error: ${lastError}` : '';
    throw new Error(
      `--ai-explain requires AI output for every item, but ${fallbackCount} item(s) used fallback.${suffix}`
    );
  }
}

function loadDotEnvIfPresent() {
  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) return;

  let raw = '';
  try {
    raw = fs.readFileSync(envPath, 'utf-8');
  } catch {
    return;
  }

  const lines = raw.split(/\r?\n/);
  for (const line of lines) {
    const trimmed = String(line || '').trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq <= 0) continue;
    const key = trimmed.slice(0, eq).trim();
    if (!key || process.env[key]) continue;
    let value = trimmed.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}
