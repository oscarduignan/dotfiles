"use strict";
var vscode = require('vscode');
var fs = require('fs');
function activate(context) {
    var disposable = vscode.commands.registerCommand('gitignore.add', function (selectedFile) {
        var filePath = selectedFile.path.substr(vscode.workspace.rootPath.length + 1, selectedFile.path.length);
        fs.open(vscode.workspace.rootPath + '/.gitignore', 'a', function (err, fd) {
            fs.readFile(vscode.workspace.rootPath + '/.gitignore', 'utf8', function (err, data) {
                if (data.indexOf(filePath) !== -1)
                    return;
                if (err || data.lastIndexOf('\n') !== data.length - 1)
                    filePath = '\n' + filePath;
                var buffer = new Buffer(filePath);
                fs.write(fd, buffer, 0, buffer.length, null, function (err) {
                    if (err)
                        throw 'error writing file: ' + err;
                    fs.close(fd, function () {
                        console.log('file written');
                    });
                });
            });
        });
    });
    context.subscriptions.push(disposable);
}
exports.activate = activate;
// this method is called when your extension is deactivated
function deactivate() {
}
exports.deactivate = deactivate;
//# sourceMappingURL=extension.js.map