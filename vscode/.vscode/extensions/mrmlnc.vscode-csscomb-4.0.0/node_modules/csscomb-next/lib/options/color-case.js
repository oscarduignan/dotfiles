'use strict';

var option = Object.defineProperties({

  /**
   * Processes ast and fixes found code style errors.
   * @param {Node} ast
   */
  process: function process(ast) {
    var value = this.value;

    ast.traverseByType('color', function (color) {
      color.content = value === 'lower' ? color.content.toLowerCase() : color.content.toUpperCase();
    });
  },

  /**
   * Detects the value of this option in ast.
   * @param {Node} ast
   * @return {Array} List of detected values
   */
  detect: function detect(ast) {
    var detected = [];

    ast.traverseByType('color', function (color) {
      if (color.content.match(/^[^A-F]*[a-f][^A-F]*$/)) {
        detected.push('lower');
      } else if (color.content.match(/^[^a-f]*[A-F][^a-f]*$/)) {
        detected.push('upper');
      }
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
      return 'color-case';
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