"use strict";
var vscode = require('vscode');
var ElixirDefinitionProvider = (function () {
    function ElixirDefinitionProvider(server) {
        this.server = server;
    }
    ElixirDefinitionProvider.prototype.provideDefinition = function (document, position, token) {
        var _this = this;
        var wordAtPosition = document.getWordRangeAtPosition(position);
        var word = document.getText(wordAtPosition);
        return new Promise(function (resolve, reject) {
            _this.server.getDefinition(document, position, function (res) {
                if (res === 'non_existing' || res === '' || res === undefined || res === null) {
                    resolve(null);
                }
                else {
                    var splitAt = res.lastIndexOf(':');
                    var location = void 0;
                    if (splitAt !== 1) {
                        var filePath = res.substring(0, splitAt);
                        var lineNumber = parseInt(res.substring(splitAt + 1, res.length)) - 1;
                        if (lineNumber >= 0) {
                            //TODO: Need to find the correct (character) position here:
                            location = new vscode.Location(vscode.Uri.file(filePath), new vscode.Position(lineNumber, 0));
                        }
                        else {
                            location = new vscode.Location(vscode.Uri.file(filePath), new vscode.Position(0, 0));
                        }
                    }
                    else {
                        location = new vscode.Location(vscode.Uri.file(res), new vscode.Position(0, 0));
                    }
                    resolve(location);
                }
            });
        });
    };
    return ElixirDefinitionProvider;
}());
exports.ElixirDefinitionProvider = ElixirDefinitionProvider;
//# sourceMappingURL=elixirDefinitionProvider.js.map