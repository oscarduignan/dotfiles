'use strict';
const vscode_1 = require('vscode');
/**
 * Transform the textdocument by setting the end of line sequence
 */
function transform(editorconfig, editor, textDocument) {
    const eol = {
        lf: vscode_1.EndOfLine.LF,
        crlf: vscode_1.EndOfLine.CRLF
    }[(editorconfig.end_of_line || '').toLowerCase()];
    if (!eol) {
        return Promise.resolve();
    }
    return editor.edit(edit => {
        edit.setEndOfLine(eol);
    });
}
exports.transform = transform;
//# sourceMappingURL=endOfLine.js.map