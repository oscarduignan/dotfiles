/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode = require("vscode");
var Window = vscode.window;
var ExpandAliasRequest;
(function (ExpandAliasRequest) {
    ExpandAliasRequest.type = { get method() { return 'powerShell/expandAlias'; } };
})(ExpandAliasRequest = exports.ExpandAliasRequest || (exports.ExpandAliasRequest = {}));
class ExpandAliasFeature {
    constructor() {
        this.command = vscode.commands.registerCommand('PowerShell.ExpandAlias', () => {
            if (this.languageClient === undefined) {
                // TODO: Log error message
                return;
            }
            var editor = Window.activeTextEditor;
            var document = editor.document;
            var selection = editor.selection;
            var text, range;
            var sls = selection.start;
            var sle = selection.end;
            if ((sls.character === sle.character) &&
                (sls.line === sle.line)) {
                text = document.getText();
                range = new vscode.Range(0, 0, document.lineCount, text.length);
            }
            else {
                text = document.getText(selection);
                range = new vscode.Range(sls.line, sls.character, sle.line, sle.character);
            }
            this.languageClient.sendRequest(ExpandAliasRequest.type, text).then((result) => {
                editor.edit((editBuilder) => {
                    editBuilder.replace(range, result);
                });
            });
        });
    }
    setLanguageClient(languageclient) {
        this.languageClient = languageclient;
    }
    dispose() {
        this.command.dispose();
    }
}
exports.ExpandAliasFeature = ExpandAliasFeature;
//# sourceMappingURL=ExpandAlias.js.map