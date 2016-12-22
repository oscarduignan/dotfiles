"use strict";
const vscode = require("vscode");
var Window = vscode.window;
class CodeActionsFeature {
    constructor() {
        this.command = vscode.commands.registerCommand('PowerShell.ApplyCodeActionEdits', (edit) => {
            var editor = Window.activeTextEditor;
            var filePath = editor.document.fileName;
            var workspaceEdit = new vscode.WorkspaceEdit();
            workspaceEdit.set(vscode.Uri.file(filePath), [
                new vscode.TextEdit(new vscode.Range(edit.StartLineNumber - 1, edit.StartColumnNumber - 1, edit.EndLineNumber - 1, edit.EndColumnNumber - 1), edit.Text)
            ]);
            vscode.workspace.applyEdit(workspaceEdit);
        });
    }
    setLanguageClient(languageclient) {
        this.languageClient = languageclient;
    }
    dispose() {
        this.command.dispose();
    }
}
exports.CodeActionsFeature = CodeActionsFeature;
//# sourceMappingURL=CodeActions.js.map