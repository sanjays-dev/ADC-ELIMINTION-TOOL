/**
 * Analyzer
 */

const path = require('path');
const { normalizeFilePath } = require('./fileUtils');

function findReachableNodes(graph, entryPoints) {
  const visited = new Set();
  const entrySet = new Set(
    (entryPoints || []).map(p => normalizeFilePath(path.resolve(p)))
  );

  // Seed reachability from obvious references.
  for (const node of graph.getAllNodes()) {
    if (node.maybeReferenced || node.isExported) {
      visited.add(node.id);
    }
  }

  // Keep imports in entry files reachable.
  for (const node of graph.getAllNodes()) {
    if (entrySet.has(normalizeFilePath(path.resolve(node.filePath))) && node.type === 'import') {
      visited.add(node.id);
    }
    if (
      entrySet.has(normalizeFilePath(path.resolve(node.filePath))) &&
      ((node.type === 'function' && node.name === 'main') ||
        (node.type === 'class' && node.name.toLowerCase() === 'app'))
    ) {
      visited.add(node.id);
    }
  }

  // Follow edges transitively.
  const stack = Array.from(visited);
  while (stack.length > 0) {
    const nodeId = stack.pop();
    for (const edge of graph.getEdges(nodeId)) {
      if (!visited.has(edge.to)) {
        visited.add(edge.to);
        stack.push(edge.to);
      }
    }
  }

  return visited;
}

function identifyDeadCode(graph, reachableNodes) {
  const deadCode = [];
  for (const node of graph.getAllNodes()) {
    if (reachableNodes.has(node.id)) continue;
    if (node.isExported) continue;
    deadCode.push({
      id: node.id,
      type: node.type,
      name: node.name,
      filePath: node.filePath,
      location: node.location || { line: 1, column: 0 },
      startLine: node.startLine || (node.location && node.location.line) || 1,
      endLine: node.endLine || (node.location && node.location.line) || 1,
      reason: 'Not reachable from entry points',
      isExported: !!node.isExported,
    });
  }
  return deadCode;
}

function analyzeCode(parsedFiles, entryPoints = []) {
  const { buildGraph } = require('./graphBuilder');
  const graph = buildGraph(parsedFiles);
  const reachableNodes = findReachableNodes(graph, entryPoints);
  const deadCodeItems = identifyDeadCode(graph, reachableNodes);

  return {
    graph,
    reachableNodes,
    deadCodeItems,
    totalNodes: graph.getAllNodes().length,
    reachableCount: reachableNodes.size,
    deadCount: deadCodeItems.length,
  };
}

module.exports = {
  findReachableNodes,
  identifyDeadCode,
  analyzeCode,
};
