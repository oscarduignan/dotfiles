"use strict";
const vscode = require('vscode');
function hasWorkspaceFolder() {
    return vscode.workspace.rootPath ? true : false;
}
function getDockerComposeFileUris() {
    if (!hasWorkspaceFolder()) {
        return Promise.resolve(null);
    }
    return Promise.resolve(vscode.workspace.findFiles('{**/[dD]ocker-[cC]ompose.*.yml,**/[dD]ocker-[cC]ompose.yml}', null, 9999, null));
}
function createItem(uri) {
    let length = vscode.workspace.rootPath.length;
    let label = uri.fsPath.substr(length);
    return {
        label: label,
        description: null,
        path: '.' + label.substr(0, label.length - '/Dockerfile'.length),
        file: '.' + label
    };
}
function computeItems(uris) {
    let items = [];
    for (let i = 0; i < uris.length; i++) {
        items.push(createItem(uris[i]));
    }
    return items;
}
function compose(command, message) {
    getDockerComposeFileUris().then(function (uris) {
        if (!uris || uris.length == 0) {
            vscode.window.showInformationMessage('Couldn\'t find any docker-compose file in your workspace.');
        }
        else {
            let items = computeItems(uris);
            vscode.window.showQuickPick(items, { placeHolder: `Choose Docker Compose file ${message}` }).then(function (selectedItem) {
                if (selectedItem) {
                    let terminal = vscode.window.createTerminal('Docker Compose');
                    terminal.sendText(`docker-compose -f ${selectedItem.file} ${command}`);
                    terminal.show();
                }
            });
        }
    });
}
exports.compose = compose;
function composeUp() {
    compose('up', 'to bring up');
}
exports.composeUp = composeUp;
function composeDown() {
    compose('down', 'to take down');
}
exports.composeDown = composeDown;
//# sourceMappingURL=docker-compose.js.map