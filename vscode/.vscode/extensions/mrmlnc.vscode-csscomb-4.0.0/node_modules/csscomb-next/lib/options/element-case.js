'use strict';

var option = Object.defineProperties({

  /**
   * Processes ast and fixes found code style errors.
   * @param {Node} ast
   */
  process: function process(ast) {
    var value = this.value;

    ast.traverse(function (node) {
      if (!node.is('selector') && !node.is('arguments')) return;

      node.forEach('typeSelector', function (selector) {
        selector.forEach('ident', function (ident) {
          ident.content = value === 'lower' ? ident.content.toLowerCase() : ident.content.toUpperCase();
        });
      });
    });
  },

  /**
   * Detects the value of this option in ast.
   * @param {Node} ast
   * @return {Array} List of detected values
   */
  detect: function detect(ast) {
    var detected = [];

    ast.traverse(function (node) {
      if (!node.is('selector') && !node.is('arguments')) return;

      node.forEach('typeSelector', function (selector) {
        selector.forEach('ident', function (ident) {
          if (ident.content.match(/^[a-z]+$/)) {
            detected.push('lower');
          } else if (ident.content.match(/^[A-Z]+$/)) {
            detected.push('upper');
          }
        });
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
      return 'element-case';
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
        string: /^lower|upper$/
      };
    },
    configurable: true,
    enumerable: true
  }
});

module.exports = option;