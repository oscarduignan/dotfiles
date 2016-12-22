'use strict';

var gonzales = require('gonzales-pe');

module.exports = {
  name: 'space-before-selector-delimiter',

  runBefore: 'block-indent',

  syntax: ['css', 'less', 'sass', 'scss'],

  accepts: {
    number: true,
    string: /^[ \t\n]*$/
  },

  /**
   * Processes tree node.
   *
   * @param {node} ast
   */
  process: function process(ast) {
    var value = this.value;

    ast.traverseByType('delimiter', function (delimiter, i, parent) {
      if (parent.is('arguments')) return;

      var previousNode = parent.get(i - 1);
      if (previousNode.is('space')) {
        previousNode.content = value;
      } else {
        var space = gonzales.createNode({
          type: 'space',
          content: value
        });
        parent.insert(i, space);
      }
    });
  },

  /**
   * Detects the value of an option at the tree node.
   *
   * @param {node} ast
   */
  detect: function detect(ast) {
    var detected = [];

    ast.traverseByType('delimiter', function (delimiter, i, parent) {
      if (parent.is('arguments')) return;

      var previousNode = parent.get(i - 1);
      if (previousNode.is('space')) {
        detected.push(previousNode.content);
      } else {
        detected.push('');
      }
    });

    return detected;
  }
};