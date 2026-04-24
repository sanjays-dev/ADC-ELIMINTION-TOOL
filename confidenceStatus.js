/**
 * Confidence status formatting for dead-code findings.
 */

function toConfidenceNumber(score) {
  const value = Number(score);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, value));
}

function getDeadCodeStatus(score) {
  const confidence = toConfidenceNumber(score);

  if (confidence >= 85) {
    return {
      level: 'high',
      confidence,
      text: '🟢 100% dead (safe to delete)',
    };
  }

  if (confidence >= 65) {
    return {
      level: 'medium',
      confidence,
      text: '🟡 70% likely dead (uncertain usage)',
    };
  }

  return {
    level: 'low',
    confidence,
    text: '🔴 30% (dynamic usage detected)',
  };
}

module.exports = {
  getDeadCodeStatus,
};

