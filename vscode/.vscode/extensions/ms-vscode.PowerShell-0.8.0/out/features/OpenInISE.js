/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode = require("vscode");
var Window = vscode.window;
const ChildProcess = require("child_process");
class OpenInISEFeature {
    constructor() {
        this.command = vscode.commands.registerCommand('PowerShell.OpenInISE', () => {
            var editor = Window.activeTextEditor;
            var document = editor.document;
            var uri = document.uri;
            if (process.env.hasOwnProperty('PROCESSOR_ARCHITEW6432')) {
                var ISEPath = process.env.windir + '\\Sysnative\\WindowsPowerShell\\v1.0\\powershell_ise.exe';
            }
            else {
                var ISEPath = process.env.windir + '\\System32\\WindowsPowerShell\\v1.0\\powershell_ise.exe';
            }
            ChildProcess.exec(ISEPath + ' -File "' + uri.fsPath + '"').unref();
        });
    }
    setLanguageClient(languageClient) {
        // Not needed for this feature.
    }
    dispose() {
        this.command.dispose();
    }
}
exports.OpenInISEFeature = OpenInISEFeature;
//# sourceMappingURL=OpenInISE.js.map