'use strict';

module.exports = {
  name: 'tab-size',

  runBefore: 'vendor-prefix-align',

  syntax: ['css', 'less', 'sass', 'scss'],

  accepts: {
    number: true
  },

  /**
   * Processes tree node.
   *
   * @param {node} ast
   */
  process: function process(ast) {
    var value = this.value;

    ast.traverseByType('space', function (space) {
      space.content = space.content.replace(/\t/, value);
    });
  }
};