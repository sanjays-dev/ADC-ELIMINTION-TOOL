/**
 * Lezer utilities
 */

function walkLezerTree(tree, callback) {
  if (!tree || typeof tree.cursor !== 'function') return;
  const cursor = tree.cursor();

  function walk() {
    callback(cursor);
    if (cursor.firstChild()) {
      do {
        walk();
      } while (cursor.nextSibling());
      cursor.parent();
    }
  }

  walk();
}

function getNodeText(content, from, to) {
  return String(content || '').slice(from, to);
}

module.exports = {
  walkLezerTree,
  getNodeText,
};

