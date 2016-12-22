/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode = require("vscode");
var Window = vscode.window;
var FindModuleRequest;
(function (FindModuleRequest) {
    FindModuleRequest.type = { get method() { return 'powerShell/findModule'; } };
})(FindModuleRequest = exports.FindModuleRequest || (exports.FindModuleRequest = {}));
var InstallModuleRequest;
(function (InstallModuleRequest) {
    InstallModuleRequest.type = { get method() { return 'powerShell/installModule'; } };
})(InstallModuleRequest = exports.InstallModuleRequest || (exports.InstallModuleRequest = {}));
class FindModuleFeature {
    constructor() {
        this.command = vscode.commands.registerCommand('PowerShell.PowerShellFindModule', () => {
            var items = [];
            vscode.window.setStatusBarMessage(this.getCurrentTime() + " Initializing...");
            this.languageClient.sendRequest(FindModuleRequest.type, null).then((modules) => {
                for (var item in modules) {
                    items.push({ label: modules[item].name, description: modules[item].description });
                }
                ;
                vscode.window.setStatusBarMessage("");
                Window.showQuickPick(items, { placeHolder: "Results: (" + modules.length + ")" }).then((selection) => {
                    if (!selection) {
                        return;
                    }
                    switch (selection.label) {
                        default:
                            var moduleName = selection.label;
                            //vscode.window.setStatusBarMessage("Installing PowerShell Module " + moduleName, 1500);
                            this.languageClient.sendRequest(InstallModuleRequest.type, moduleName);
                    }
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
    getCurrentTime() {
        var timeNow = new Date();
        var hours = timeNow.getHours();
        var minutes = timeNow.getMinutes();
        var seconds = timeNow.getSeconds();
        var timeString = "" + ((hours > 12) ? hours - 12 : hours);
        timeString += ((minutes < 10) ? ":0" : ":") + minutes;
        timeString += ((seconds < 10) ? ":0" : ":") + seconds;
        timeString += (hours >= 12) ? " PM" : " AM";
        return timeString;
    }
}
exports.FindModuleFeature = FindModuleFeature;
//# sourceMappingURL=PowerShellFindModule.js.map