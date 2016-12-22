'use strict';

var gonzales = require('gonzales-pe');

module.exports = (function () {
  var valueFromSettings;
  var blockIndent;

  function getLastWhitespaceNode(_x) {
    var _again = true;

    _function: while (_again) {
      var node = _x;
      _again = false;

      var lastNode = node.last();

      if (!lastNode || !lastNode.content) return null;

      if (lastNode.is('block')) return null;
      if (lastNode.is('space')) return lastNode;

      _x = lastNode;
      _again = true;
      lastNode = undefined;
      continue _function;
    }
  }

  function processBlock(x, level) {
    level = level || 0;

    x.forEach(function (node) {
      if (!node.is('block') && !node.is('atrulers')) return processBlock(node, level);

      level++;

      var value = valueFromSettings;
      if (value.indexOf('\n') > -1) {
        // TODO: Check that it works for '' block indent value <tg>
        if (blockIndent) {
          value += new Array(level).join(blockIndent);
        }
      }

      // If found block node stop at the next one for space check
      // For the pre-block node, find its last (the deepest) child
      var whitespaceNode = getLastWhitespaceNode(node);

      // If it's spaces, modify this node
      // If it's something different from spaces, add a space node
      // to the end
      if (whitespaceNode) {
        whitespaceNode.content = value;
      } else if (value !== '') {
        var space = gonzales.createNode({
          type: 'space',
          content: value
        });
        node.content.push(space);
      }

      processBlock(node, level);
    });
  }

  return {
    name: 'space-before-closing-brace',

    runBefore: 'tab-size',

    syntax: ['css', 'less', 'scss'],

    accepts: {
      number: true,
      string: /^[ \t\n]*$/
    },

    /**
     * Processes tree node.
     * @param {node} ast
     * @param {Object} config
     */
    process: function process(ast, config) {
      valueFromSettings = this.value;
      blockIndent = config['block-indent'];

      processBlock(ast);
    },

    /**
     * Detects the value of an option at the tree node.
     *
     * @param {node} ast
     */
    detect: function detect(ast) {
      var detected = [];

      ast.traverseByTypes(['block', 'atrulers'], function (node) {
        // For the block node, find its last (the deepest) child
        var whitespaceNode = getLastWhitespaceNode(node);
        if (whitespaceNode) {
          detected.push(whitespaceNode.content);
        } else {
          detected.push('');
        }
      });

      return detected;
    }
  };
})();