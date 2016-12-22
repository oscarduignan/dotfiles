'use strict';

var gonzales = require('gonzales-pe');

var option = Object.defineProperties({
  newLinesString: '',
  newLinesNode: null,

  /**
   * @param {number} value
   * @returns {number}
   */
  /*
  ** Still need to override, as the core implementation of setValue doesn't
  ** pass numbers through, but creates a string of spaces of the same length.
  */
  setValue: function setValue(value) {
    var valueType = typeof value;

    if (valueType !== 'number') {
      throw new Error('Value must be a number.');
    }

    return value;
  },

  buildSpacing: function buildSpacing(syntax) {
    var spacing = '';
    var numNewLines = 0;
    var newLinesOffset = 1;

    if (syntax === 'sass') {
      newLinesOffset = 0;
    }

    numNewLines = Math.round(this.value) + newLinesOffset;

    for (var i = 0; i < numNewLines; i++) {
      spacing += '\n';
    }

    return spacing;
  },

  /**
   * Processes ast and fixes found code style errors.
   * @param {Node} ast
   */
  process: function process(ast) {
    this.newLinesString = this.buildSpacing(ast.syntax);
    this.newLinesNode = gonzales.createNode({
      type: 'space',
      content: this.newLinesString
    });
    this.processBlock(ast);
  },

  processBlock: function processBlock(x) {
    var _this = this;

    if (x.is('stylesheet')) {
      // Check all @rules
      this.processAtRules(x);

      // Check all rulesets
      this.processRuleSets(x);
    }

    x.forEach(function (node) {
      if (!node.is('block')) {
        return _this.processBlock(node);
      }

      // Check all @rules
      _this.processAtRules(node);

      // Check all rulesets
      _this.processRuleSets(node);

      _this.processBlock(node);
    });
  },

  processAtRules: function processAtRules(node) {
    var _this2 = this;

    node.forEach('atrule', function (atRuleNode, index) {
      _this2.insertNewlines(node, index);
    });
  },

  processRuleSets: function processRuleSets(node) {
    var _this3 = this;

    node.forEach('ruleset', function (ruleSetNode, index) {
      _this3.insertNewlines(node, index);
    });
  },

  isComment: function isComment(node) {
    if (!node) {
      return false;
    }
    return node.is('singlelineComment') || node.is('multilineComment');
  },

  isNewline: function isNewline(node) {
    if (!node) {
      return false;
    }
    return node.content === '\n';
  },

  prevLineIsComment: function prevLineIsComment(parent, index) {
    var indexThreshold = 2;
    var prevChild = undefined;
    var prevMinusOneChild = undefined;
    var prevMinusTwoChild = undefined;
    var parentSyntax = parent ? parent.syntax : null;

    // Sass is troublesome because newlines are counted as separate nodes
    if (parentSyntax === 'sass') {
      indexThreshold = 3;
    }

    if (!parent || index < indexThreshold) {
      return false;
    }

    prevChild = parent.get(index - 1);
    prevMinusOneChild = parent.get(index - 2);

    if (parentSyntax === 'sass') {
      prevMinusTwoChild = parent.get(index - 3);
      return this.isComment(prevMinusTwoChild) && this.isNewline(prevMinusOneChild) && prevChild.is('space');
    }

    return this.isComment(prevMinusOneChild) && prevChild.is('space');
  },

  /*
  ** Find the latest previous child that isn't a comment, and return its index.
  */
  findLatestNonCommentNode: function findLatestNonCommentNode(parent, index) {
    var prevChild = undefined;
    var lastNonCommentIndex = -1;
    var currentIndex = index;
    var jumpSize = 2;

    if (parent.syntax === 'sass') {
      jumpSize = 3;
    }

    while (currentIndex >= 0) {
      if (this.prevLineIsComment(parent, currentIndex)) {
        currentIndex -= jumpSize;
        continue;
      }

      prevChild = parent.get(currentIndex - 1);

      if (!this.isComment(prevChild)) {
        lastNonCommentIndex = currentIndex - 1;
        break;
      }

      currentIndex--;
    }

    return lastNonCommentIndex;
  },

  insertNewlinesAsString: function insertNewlinesAsString(node) {
    var content = node.content;
    var lastNewline = content.lastIndexOf('\n');
    var newContent = undefined;

    if (lastNewline > -1) {
      content = content.substring(lastNewline + 1);
    }

    newContent = this.newLinesString + content;
    node.content = newContent;
  },

  insertNewlinesAsNode: function insertNewlinesAsNode(node) {
    node.insert(node.length, this.newLinesNode);
  },

  insertNewlines: function insertNewlines(node, index) {
    var prevChild = node.get(index - 1);
    var shouldInsert = false;

    // Check for previous nodes that are not a space
    // Do not insert if the ruleset is the first item
    for (var i = 0; i < index; i++) {
      if (!node.get(i).is('space')) {
        shouldInsert = true;
        break;
      }
    }

    if (prevChild && shouldInsert) {
      if (this.prevLineIsComment(node, index) || this.isComment(prevChild)) {
        var lastNonCommentIndex = this.findLatestNonCommentNode(node, index);
        prevChild = node.get(lastNonCommentIndex);
      }

      if (prevChild.is('space')) {
        this.insertNewlinesAsString(prevChild);
      } else {
        this.insertNewlinesAsNode(prevChild);
      }
    }
  }
}, {
  name: { /**
           * Option's name as it's used in config.
           * @type {String}
           */

    get: function get() {
      return 'lines-between-rulesets';
    },
    configurable: true,
    enumerable: true
  },
  runBefore: {

    /**
     * Name of option that must run after this option.
     * @type {String}
     */

    get: function get() {
      return 'block-indent';
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
        number: true
      };
    },
    configurable: true,
    enumerable: true
  }
});

module.exports = option;