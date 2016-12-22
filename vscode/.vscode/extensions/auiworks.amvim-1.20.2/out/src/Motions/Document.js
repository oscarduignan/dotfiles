"use strict";
const vscode_1 = require("vscode");
const Motion_1 = require("./Motion");
class MotionDocument extends Motion_1.Motion {
    static toLine(args) {
        const obj = new MotionDocument({ isLinewise: true });
        obj.line = args.n - 1;
        return obj;
    }
    apply(from) {
        from = super.apply(from);
        const activeTextEditor = vscode_1.window.activeTextEditor;
        if (!activeTextEditor || this.line === undefined) {
            return from;
        }
        const document = activeTextEditor.document;
        let line = this.line;
        line = Math.max(0, this.line);
        line = Math.min(document.lineCount, this.line);
        return from.with(line);
    }
}
exports.MotionDocument = MotionDocument;
//# sourceMappingURL=Document.js.map