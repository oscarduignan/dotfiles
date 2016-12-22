'use strict';

var gonzales = require('gonzales-pe');

var option = Object.defineProperties({

  /**
   * Processes ast and fixes found code style errors.
   * @param {Node} ast
   */
  process: function process(ast) {
    var lastChild = ast.last();

    if (!lastChild.is('space')) {
      lastChild = gonzales.createNode({ type: 'space', content: '' });
      ast.content.push(lastChild);
    }

    lastChild.content = lastChild.content.replace(/\n$/, '');
    if (this.value) lastChild.content += '\n';
  },

  /**
   * Detects the value of this option in ast.
   * @param {Node} ast
   * @return {Array} List of detected values
   */
  detect: function detect(ast) {
    var lastChild = ast.last();

    if (lastChild.is('space') && lastChild.content.indexOf('\n') !== -1) {
      return [true];
    } else {
      return [false];
    }
  }
}, {
  name: {
    /**
     * Option's name as it's used in config.
     * @type {String}
     */

    get: function get() {
      return 'eof-newline';
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
        boolean: [true, false]
      };
    },
    configurable: true,
    enumerable: true
  }
});

module.exports = option;