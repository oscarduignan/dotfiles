'use strict';
const vscode = require("vscode");
const detectIndent = require("detect-indent");
const config_1 = require("./config");
class Comb {
    constructor() {
        this.config = new config_1.Config();
        this.settings = this.config.getEditorConfiguration();
        // code
    }
    use(document, selection, preset) {
        // Update
        this.document = document;
        this.selection = selection;
        this.preset = preset;
        // If it's not CSS and we don't support embedded styles
        if (!this.checkSyntax(this.document) && !this.settings.supportEmbeddedStyles) {
            throw new Error('Cannot execute CSScomb because there is not style files. Supported: LESS, SCSS, SASS and CSS.');
        }
        // Require CSSComb module & configuration file
        this.requireCore();
        // If configuration is broken then show error and use standard configuration
        if (this.preset === 'syntaxError') {
            vscode.window.showErrorMessage('Provided JSON file contains syntax errors!');
            this.preset = {};
        }
        if (!this.preset) {
            this.preset = {};
        }
        // If preset is string then get configuration from CSSComb module
        if (typeof this.preset === 'string') {
            this.preset = this.Comb.getConfig(this.preset);
        }
        // Creates instance of CSSComb
        const comb = new this.Comb();
        comb.configure(this.preset);
        this.syntax = this.document.languageId;
        if (/sass/.test(this.syntax)) {
            this.syntax = 'sass';
        }
        const content = this.getTextAndRange();
        try {
            let result = comb.processString(content.text, { syntax: this.syntax });
            if (content.embeddedRange && this.settings.supportEmbeddedStyles && Object.keys(this.preset).length !== 0) {
                result = result.split('\n').map((x, index) => {
                    if (index !== 0 && x !== '') {
                        return content.embeddedRange.indent + x;
                    }
                    return x;
                }).join('\n');
            }
            return Promise.resolve({
                css: result,
                range: content.range
            });
        }
        catch (err) {
            return Promise.reject(err);
        }
    }
    checkSyntax(document) {
        return /(css|less|scss|sass)/.test(document.languageId);
    }
    requireCore() {
        const moduleVersion = this.settings.useLatestCore ? '-next' : '';
        this.Comb = require(`csscomb${moduleVersion}`);
    }
    getTextAndRange() {
        let embeddedRange;
        let range;
        let text;
        if (this.syntax === 'html' && this.settings.supportEmbeddedStyles) {
            embeddedRange = this.searchEmbeddedStyles();
            if (embeddedRange) {
                range = embeddedRange.range;
                text = this.document.getText(range);
                this.syntax = 'css';
            }
        }
        else if (!this.selection || (this.selection && this.selection.isEmpty)) {
            const lastLine = this.document.lineAt(this.document.lineCount - 1);
            const start = new vscode.Position(0, 0);
            const end = new vscode.Position(this.document.lineCount - 1, lastLine.text.length);
            range = new vscode.Range(start, end);
            text = this.document.getText();
        }
        else {
            range = new vscode.Range(this.selection.start, this.selection.end);
            text = this.document.getText(range);
        }
        return {
            text,
            range,
            embeddedRange
        };
    }
    searchEmbeddedStyles() {
        if (this.document.languageId !== 'html') {
            return null;
        }
        const text = this.document.getText();
        let startTag = text.indexOf('<style>');
        let endTag = text.indexOf('</style>');
        if (startTag === -1 || endTag === -1) {
            return null;
        }
        let indent = '';
        let indentNumber = 0;
        let pos = startTag - 1;
        while (text[pos] !== '\n') {
            indent += text[pos];
            indentNumber++;
            pos--;
        }
        indent += detectIndent(text).indent;
        return {
            indent,
            range: new vscode.Range(this.document.positionAt(startTag + 8), this.document.positionAt(endTag - indentNumber))
        };
    }
}
exports.Comb = Comb;
