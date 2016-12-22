/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
var vscode = require('vscode');
function getStatusBarItem() {
    if (statusBarItem == undefined) {
        // Create the status bar item and place it right next
        // to the language indicator
        statusBarItem =
            vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 1);
        statusBarItem.command = ShowStatusBarMenuCommandName;
        statusBarItem.show();
    }
    return statusBarItem;
}
function getStatusColor(status) {
    switch (status) {
        case ExtensionStatus.Initializing:
            return ";";
        default:
            break;
    }
}
function setExtensionStatus(statusText, status) {
    var item = getStatusBarItem();
    // Set color and icon for 'Running' by default
    var statusIconText = "$(terminal) ";
    var statusColor = "#affc74";
    if (status == ExtensionStatus.Initializing) {
        statusIconText = "$(sync) ";
        statusColor = "#f3fc74";
    }
    else if (status == ExtensionStatus.Failed) {
        statusIconText = "$(alert) ";
        statusColor = "#fcc174";
    }
    item.color = statusColor;
    item.text = statusIconText + statusText;
}
exports.setExtensionStatus = setExtensionStatus;
vscode.commands.registerCommand(ShowStatusBarMenuCommandName, function () {
    vscode.window.showQuickPick(["Restart Current Session",
        "Switch to PowerShell (x86)"], { ignoreFocusOut: true });
});
//# sourceMappingURL=status.js.map