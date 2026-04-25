/**
 * AI explanation helper for dead-code removals.
 */

const https = require('https');

class AiExplainer {
  constructor(options = {}) {
    this.provider = String(options.provider || process.env.AI_PROVIDER || 'openai').toLowerCase();
    this.apiKey = resolveApiKey(this.provider, options.apiKey);
    this.model = resolveModel(this.provider, options.model);
    this.baseUrl = resolveBaseUrl(this.provider, this.model, options.baseUrl);
    this.timeoutMs = Number.isFinite(options.timeoutMs) ? options.timeoutMs : 15000;
    this.aiFailureCount = 0;
    this.lastAiError = '';
    this.fallbackCount = 0;
    this.aiSuccessCount = 0;
  }

  isEnabled() {
    return Boolean(this.apiKey);
  }

  async explainItems(items) {
    const explained = [];
    this.fallbackCount = 0;
    this.aiSuccessCount = 0;
    for (const item of items) {
      let explanation = '';
      if (this.isEnabled()) {
        try {
          explanation = await this.explainWithAi(item);
          explanation = normalizeAiExplanation(explanation, item);
        } catch (error) {
          this.aiFailureCount += 1;
          this.lastAiError = normalizeErrorMessage(error);
          explanation = '';
        }
      }
      const usedFallback = !explanation;
      if (usedFallback) this.fallbackCount += 1;
      else this.aiSuccessCount += 1;
      explained.push({
        ...item,
        explanation: explanation || buildFallbackExplanation(item),
        explanationSource: usedFallback ? 'fallback' : 'ai',
      });
    }
    return explained;
  }

  async explainWithAi(item) {
    const prompt = [
      'You are explaining dead code cleanup.',
      'Give exactly one short sentence, plain English, no markdown.',
      'Include why this code is considered removable.',
      `Code type: ${item.type}`,
      `Name: ${item.name}`,
      `Reason: ${item.reason || 'Unreachable or unused in analyzed graph'}`,
      `File: ${item.filePath}:${item.location ? item.location.line : item.line || 1}`,
      `Confidence: ${item.confidenceScore || 0}`,
    ].join('\n');

    let text = '';
    if (this.provider === 'hf' || this.provider === 'huggingface') {
      const payload = JSON.stringify({
        inputs: prompt,
        parameters: {
          max_new_tokens: 60,
          temperature: 0.2,
        },
        options: {
          wait_for_model: true,
        },
      });
      const response = await postJson(this.baseUrl, payload, this.apiKey, this.timeoutMs);
      text = extractTextFromHf(response).trim();
    } else {
      const payload = JSON.stringify({
        model: this.model,
        input: prompt,
        max_output_tokens: 60,
        temperature: 0.2,
      });
      const response = await postJson(this.baseUrl, payload, this.apiKey, this.timeoutMs);
      text = extractTextFromOpenAi(response).trim();
    }

    return text;
  }

  hasAiFailures() {
    return this.aiFailureCount > 0;
  }

  getLastAiError() {
    return this.lastAiError || '';
  }

  getFallbackCount() {
    return this.fallbackCount || 0;
  }

  getAiSuccessCount() {
    return this.aiSuccessCount || 0;
  }
}

function buildFallbackExplanation(item) {
  const type = String(item.type || '').toLowerCase();
  if (type === 'function') {
    return `Function "${item.name}" is never called from any reachable entry point, so its body (including returns) is unused.`;
  }
  if (type === 'variable') {
    return `Variable "${item.name}" is assigned but never read by any reachable code path.`;
  }
  if (type === 'import') {
    return `Import "${item.name}" is not referenced by any reachable code path.`;
  }
  if (type === 'class') {
    return `Class "${item.name}" is never instantiated or referenced from reachable code paths.`;
  }
  if (type === 'unreachable') {
    return `This statement is unreachable and never executes.`;
  }
  return `This item is unreachable or unused from current entry points.`;
}

function extractTextFromOpenAi(responseBody) {
  if (!responseBody || typeof responseBody !== 'object') return '';
  if (typeof responseBody.output_text === 'string') return responseBody.output_text;
  const output = Array.isArray(responseBody.output) ? responseBody.output : [];
  for (const block of output) {
    const content = Array.isArray(block && block.content) ? block.content : [];
    for (const part of content) {
      if (part && part.type === 'output_text' && typeof part.text === 'string') {
        return part.text;
      }
      if (part && typeof part.text === 'string') {
        return part.text;
      }
    }
  }
  return '';
}

function extractTextFromHf(responseBody) {
  if (!responseBody) return '';

  if (typeof responseBody === 'string') {
    return responseBody;
  }

  if (Array.isArray(responseBody) && responseBody.length > 0) {
    const first = responseBody[0];
    if (first && typeof first.generated_text === 'string') return first.generated_text;
    if (first && typeof first.translation_text === 'string') return first.translation_text;
    if (first && typeof first.summary_text === 'string') return first.summary_text;
    return JSON.stringify(first);
  }

  if (typeof responseBody === 'object') {
    if (typeof responseBody.generated_text === 'string') return responseBody.generated_text;
    if (typeof responseBody.translation_text === 'string') return responseBody.translation_text;
    if (typeof responseBody.summary_text === 'string') return responseBody.summary_text;
    if (responseBody.error) return '';
  }

  return '';
}

function postJson(urlString, payload, apiKey, timeoutMs) {
  return new Promise((resolve, reject) => {
    const url = new URL(urlString);
    const req = https.request(
      {
        protocol: url.protocol,
        hostname: url.hostname,
        path: `${url.pathname}${url.search}`,
        method: 'POST',
        port: url.port || (url.protocol === 'https:' ? 443 : 80),
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
          Authorization: `Bearer ${apiKey}`,
        },
      },
      res => {
        let body = '';
        res.setEncoding('utf8');
        res.on('data', chunk => {
          body += chunk;
        });
        res.on('end', () => {
          try {
            const parsed = body ? JSON.parse(body) : {};
            if (res.statusCode && res.statusCode >= 400) {
              const errorMessage =
                (parsed && parsed.error && typeof parsed.error.message === 'string' && parsed.error.message) ||
                (parsed && typeof parsed.error === 'string' && parsed.error) ||
                `HTTP ${res.statusCode}`;
              return reject(new Error(errorMessage));
            }
            return resolve(parsed);
          } catch {
            if (res.statusCode && res.statusCode >= 400) {
              return reject(new Error(`HTTP ${res.statusCode}`));
            }
            return resolve(body || '');
          }
        });
      }
    );

    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error('AI request timed out'));
    });
    req.on('error', reject);
    req.write(payload);
    req.end();
  });
}

function resolveApiKey(provider, explicitApiKey) {
  if (explicitApiKey) return explicitApiKey;
  if (provider === 'hf' || provider === 'huggingface') {
    return process.env.HF_API_KEY || process.env.HUGGINGFACE_API_KEY || process.env.HF_TOKEN || '';
  }
  return process.env.OPENAI_API_KEY || '';
}

function resolveModel(provider, explicitModel) {
  if (explicitModel) return explicitModel;
  if (provider === 'hf' || provider === 'huggingface') {
    return process.env.HF_MODEL || 'google-t5/t5-small';
  }
  return process.env.OPENAI_MODEL || 'gpt-4o-mini';
}

function resolveBaseUrl(provider, model, explicitBaseUrl) {
  if (explicitBaseUrl) return explicitBaseUrl;
  if (provider === 'hf' || provider === 'huggingface') {
    return process.env.HF_BASE_URL || `https://router.huggingface.co/hf-inference/models/${model}`;
  }
  return process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1/responses';
}

function normalizeErrorMessage(error) {
  if (!error) return 'Unknown AI error';
  if (typeof error.message === 'string' && error.message.trim()) return error.message.trim();
  if (typeof error.code === 'string' && error.code.trim()) return error.code.trim();
  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function normalizeAiExplanation(text, item) {
  if (typeof text !== 'string') return '';
  const compact = text.replace(/\s+/g, ' ').trim();
  if (!compact) return '';
  if (!/[A-Za-z]/.test(compact)) return '';
  if (compact.length < 12) return '';

  const firstSentence = compact.split(/(?<=[.!?])\s+/)[0] || compact;
  if (/(?:\bFile:|\bDatei:|\bConfidence:|\bReason:)/i.test(firstSentence)) {
    return buildFallbackExplanation(item);
  }
  const concise = /not called|never called|unused|not used|unreachable|not referenced/i.test(firstSentence)
    ? firstSentence
    : buildFallbackExplanation(item);

  return /[.!?]$/.test(concise) ? concise : `${concise}.`;
}

module.exports = {
  AiExplainer,
  buildFallbackExplanation,
};
