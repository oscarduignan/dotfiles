'use strict';

var gonzales = require('gonzales-pe');

var option = Object.defineProperties({

  /**
   * Checks ast for code style errors.
   *
   * @param {Node} ast
   * @return {Array?} List of found errors.
   */
  lint: function lint(ast) {
    var errors = [];

    ast.traverseByType('block', function (block) {
      block.eachFor(function (currentNode) {
        var nodeWithoutSemicolon;
        // Skip nodes that already have `;` at the end:
        if (currentNode.is('declarationDelimiter')) return null;

        // Add semicolon only after declarations and includes.
        // If current node is include, insert semicolon right into it.
        // If it's declaration, look for value node:
        if (currentNode.is('include') || currentNode.is('extend')) {
          nodeWithoutSemicolon = currentNode;
        } else if (currentNode.is('declaration')) {
          nodeWithoutSemicolon = currentNode.last('value');
        } else {
          return;
        }

        errors.push({
          message: 'Missing semicolon',
          line: nodeWithoutSemicolon.end.line,
          column: nodeWithoutSemicolon.end.column + 1
        });

        // Stop looping through block's children:
        return null;
      });
    });

    return errors;
  },

  /**
   * Processes ast and fixes found code style errors.
   * @param {Node} ast
   */
  process: function process(ast) {
    var nodeWithoutSemicolon;

    ast.traverseByType('block', function (block) {
      block.eachFor(function (currentNode) {
        // Skip nodes that already have `;` at the end:
        if (currentNode.is('declarationDelimiter')) return null;

        // Add semicolon only after declarations and includes.
        // If current node is include, insert semicolon right into it.
        // If it's declaration, look for value node:
        if (currentNode.is('include') || currentNode.is('extend')) {
          nodeWithoutSemicolon = currentNode;
        } else if (currentNode.is('declaration')) {
          nodeWithoutSemicolon = currentNode.last('value');
        } else {
          return;
        }

        // Check if there are spaces and comments at the end of the node
        for (var j = nodeWithoutSemicolon.length; j--;) {
          var lastNode = nodeWithoutSemicolon.get(j);

          // If the node's last child is block, do not add semicolon:
          // TODO: Add syntax check and run the code only for scss
          if (lastNode.is('block')) {
            return null;
          } else if (!lastNode.is('space') && !lastNode.is('multilineComment') && !lastNode.is('singlelineComment')) {
            j++;
            break;
          }
        }

        var declDelim = gonzales.createNode({
          type: 'declarationDelimiter',
          content: ';'
        });
        nodeWithoutSemicolon.insert(j, declDelim);
        return null;
      });
    });
  },

  /**
   * Detects the value of this option in ast.
   * @param {Node} ast
   * @return {Array?} List of detected values
   */
  detect: function detect(ast) {
    var detected = [];

    ast.traverseByType('block', function (block) {
      block.eachFor(function (node) {
        if (node.is('declarationDelimiter')) {
          detected.push(true);
          return null;
        } else if (node.is('declaration')) {
          detected.push(false);
          return null;
        }
      });
    });

    return detected;
  }
}, {
  name: {
    /**
     * Option's name as it's used in config.
     * @type {String}
     */

    get: function get() {
      return 'always-semicolon';
    },
    configurable: true,
    enumerable: true
  },
  syntax: {

    /**
     * List of syntaxes that are supported by this option.
     * @type {Array}
     */

    get: function get() {
      return ['css', 'less', 'sass', 'scss'];
    },
    configurable: true,
    enumerable: true
  },
  accepts: {

    /**
     * Types of values this option accepts in config.
     * @type {Object}
     */

    get: function get() {
      return {
        boolean: [true]
      };
    },
    configurable: true,
    enumerable: true
  }
});

module.exports = option;