/**
 * Graph Builder
 */

const { findNodeByType, getNodeLocation, getNodeName } = require('./astUtils');
const { createId, normalizeFilePath } = require('./fileUtils');

class DependencyGraph {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
  }

  addNode(id, data) {
    this.nodes.set(id, { id, ...data });
  }

  addEdge(from, to, type = 'reference') {
    if (!this.edges.has(from)) this.edges.set(from, []);
    this.edges.get(from).push({ to, type });
  }

  getEdges(from) {
    return this.edges.get(from) || [];
  }

  getAllNodes() {
    return Array.from(this.nodes.values());
  }
}

function buildGraph(parsedFiles) {
  const graph = new DependencyGraph();
  const allContents = [];

  for (const [filePath, parsed] of parsedFiles.entries()) {
    if (!parsed || parsed.error || !parsed.ast) continue;
    const normalizedPath = normalizeFilePath(filePath);
    allContents.push(String(parsed.content || ''));

    if (parsed.language === 'javascript' || parsed.language === 'typescript') {
      extractJsTs(parsed.ast, normalizedPath, graph);
    } else {
      extractSimple(parsed.ast, normalizedPath, parsed.language, graph);
    }
  }

  annotateReferences(graph, allContents.join('\n'));

  return graph;
}

function extractJsTs(ast, filePath, graph) {
  const functionDecls = findNodeByType(ast, 'FunctionDeclaration');
  for (const fn of functionDecls) {
    const name = getNodeName(fn);
    const loc = getNodeLocation(fn);
    const id = createId(filePath, name, loc.line);
    graph.addNode(id, {
      type: 'function',
      name,
      filePath,
      location: { line: loc.line, column: loc.column },
      startLine: (fn.loc && fn.loc.start && fn.loc.start.line) || loc.line,
      endLine: (fn.loc && fn.loc.end && fn.loc.end.line) || loc.line,
      isExported: false,
    });
  }

  const classDecls = findNodeByType(ast, 'ClassDeclaration');
  for (const cls of classDecls) {
    const name = getNodeName(cls);
    const loc = getNodeLocation(cls);
    const id = createId(filePath, name, loc.line);
    graph.addNode(id, {
      type: 'class',
      name,
      filePath,
      location: { line: loc.line, column: loc.column },
      startLine: (cls.loc && cls.loc.start && cls.loc.start.line) || loc.line,
      endLine: (cls.loc && cls.loc.end && cls.loc.end.line) || loc.line,
      isExported: false,
    });
  }

  const varDecls = findNodeByType(ast, 'VariableDeclaration');
  for (const decl of varDecls) {
    const loc = getNodeLocation(decl);
    const startLine = (decl.loc && decl.loc.start && decl.loc.start.line) || loc.line;
    const endLine = (decl.loc && decl.loc.end && decl.loc.end.line) || loc.line;
    for (const d of decl.declarations || []) {
      const name = getNodeName(d);
      const id = createId(filePath, name, loc.line);
      graph.addNode(id, {
        type: 'variable',
        name,
        filePath,
        location: { line: loc.line, column: loc.column },
        startLine,
        endLine,
        isExported: false,
      });
    }
  }

  const imports = findNodeByType(ast, 'ImportDeclaration');
  for (const imp of imports) {
    const loc = getNodeLocation(imp);
    const id = createId(filePath, `import:${loc.line}`, loc.line);
    graph.addNode(id, {
      type: 'import',
      name: imp.source && imp.source.value ? imp.source.value : 'import',
      filePath,
      location: { line: loc.line, column: loc.column },
      startLine: (imp.loc && imp.loc.start && imp.loc.start.line) || loc.line,
      endLine: (imp.loc && imp.loc.end && imp.loc.end.line) || loc.line,
      isExported: false,
    });
  }
}

function extractSimple(ast, filePath, language, graph) {
  for (const node of ast.body || []) {
    const line = node.lineno || 1;
    let type = 'variable';
    if (node.type.includes('Unreachable')) type = 'unreachable';
    else
    if (node.type.includes('Function') || node.type === 'MethodDeclaration') type = 'function';
    else if (node.type.includes('Class')) type = 'class';
    else if (node.type.includes('Import') || node.type.includes('Include')) type = 'import';
    const name = node.name || (node.names ? node.names.join(',') : 'anonymous');
    const id = createId(filePath, name, line);
    graph.addNode(id, {
      type,
      name,
      filePath,
      language,
      location: { line, column: 0 },
      startLine: node.startLine || line,
      endLine: node.endLine || line,
      isExported: false,
    });
  }
}

function annotateReferences(graph, corpus) {
  for (const [id, node] of graph.nodes.entries()) {
    if (!node || !node.name || node.name === 'anonymous') continue;
    let count = 0;
    if (node.type === 'function') {
      count = countMatches(corpus, new RegExp(`\\b${escapeRegExp(node.name)}\\s*\\(`, 'g'));
      node.maybeReferenced = count > 1;
    } else if (node.type === 'class') {
      count = countMatches(corpus, new RegExp(`\\b${escapeRegExp(node.name)}\\b`, 'g'));
      node.maybeReferenced = count > 1;
    } else if (node.type === 'variable') {
      count = countMatches(corpus, new RegExp(`\\b${escapeRegExp(node.name)}\\b`, 'g'));
      node.maybeReferenced = count > 1;
    } else if (node.type === 'import') {
      node.maybeReferenced = false;
    } else if (node.type === 'unreachable') {
      node.maybeReferenced = false;
    }
    graph.nodes.set(id, node);
  }
}

function countMatches(text, regex) {
  const matches = text.match(regex);
  return matches ? matches.length : 0;
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

module.exports = {
  DependencyGraph,
  buildGraph,
};
