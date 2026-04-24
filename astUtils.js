/**
 * AST utilities
 */

function findNodeByType(node, targetType, results = []) {
  if (!node || typeof node !== 'object') return results;
  if (node.type === targetType) results.push(node);

  for (const key in node) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (!value || typeof value !== 'object') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') findNodeByType(item, targetType, results);
      }
    } else {
      findNodeByType(value, targetType, results);
    }
  }

  return results;
}

function walkAST(node, callback) {
  if (!node || typeof node !== 'object') return;
  callback(node);

  for (const key in node) {
    if (key === 'loc' || key === 'start' || key === 'end') continue;
    const value = node[key];
    if (!value || typeof value !== 'object') continue;

    if (Array.isArray(value)) {
      for (const item of value) {
        if (item && typeof item === 'object') walkAST(item, callback);
      }
    } else {
      walkAST(value, callback);
    }
  }
}

function getNodeLocation(node) {
  if (node && node.loc && node.loc.start && typeof node.loc.start.line === 'number') {
    return { line: node.loc.start.line, column: node.loc.start.column || 0 };
  }
  if (node && typeof node.lineno === 'number') {
    return { line: node.lineno, column: 0 };
  }
  return { line: 0, column: 0 };
}

function getNodeName(node) {
  if (!node) return 'anonymous';
  if (node.id && node.id.name) return node.id.name;
  if (node.name) return node.name;
  if (node.key && node.key.name) return node.key.name;
  if (node.local && node.local.name) return node.local.name;
  return 'anonymous';
}

function isNodeType(node, ...types) {
  return !!(node && types.includes(node.type));
}

module.exports = {
  findNodeByType,
  walkAST,
  getNodeLocation,
  getNodeName,
  isNodeType,
};

