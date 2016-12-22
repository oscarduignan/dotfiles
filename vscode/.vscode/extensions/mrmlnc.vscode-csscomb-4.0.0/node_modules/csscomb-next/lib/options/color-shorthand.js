'use strict';

var option = Object.defineProperties({

  /**
   * Processes ast and fixes found code style errors.
   * @param {Node} ast
   */
  process: function process(ast) {
    var value = this.value;

    ast.traverseByType('color', function (color) {
      color.content = value ? color.content.replace(/(\w)\1(\w)\2(\w)\3/i, '$1$2$3') : color.content.replace(/^(\w)(\w)(\w)$/, '$1$1$2$2$3$3');
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
      if (color.content.match(/^\w{3}$/)) {
        detected.push(true);
      } else if (color.content.match(/^(\w)\1(\w)\2(\w)\3$/)) {
        detected.push(false);
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
      return 'color-shorthand';
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