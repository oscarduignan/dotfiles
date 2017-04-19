"use strict";
var vscode = require('vscode');
var cp = require('child_process');
var path = require('path');
var ElixirServer = (function () {
    function ElixirServer() {
        var extensionPath = vscode.extensions.getExtension("mjmcloug.vscode-elixir").extensionPath;
        this.command = 'elixir';
        this.args = [path.join(extensionPath, 'alchemist-server/run.exs')];
        this.env = 'dev';
        this.buffer = '';
        this.busy = false;
    }
    ElixirServer.prototype.start = function () {
        var _this = this;
        var projectPath = "";
        if (vscode.workspace.rootPath !== undefined) {
            projectPath = path.join(vscode.workspace.rootPath);
        }
        else {
            var savedFiles = vscode.workspace.textDocuments.filter(function (value) {
                return value.uri.scheme === 'file';
            });
            if (savedFiles.length > 0) {
                projectPath = path.dirname(savedFiles[0].fileName);
            }
            else {
                // Bail out, lets use our extensionPath as projectPath
                projectPath = vscode.extensions.getExtension("mjmcloug.vscode-elixir").extensionPath;
            }
        }
        var optionsWin = { cwd: projectPath, windowsVerbatimArguments: true, stdio: 'pipe' };
        var optionsUnix = { cwd: projectPath, stdio: 'pipe' };
        if (process.platform === 'win32') {
            var windowsPath = "\"" + this.args + "\"";
            this.p = cp.spawn('cmd', ['/s', '/c', '"' + [this.command].concat(windowsPath).concat(this.env).join(' ') + '"'], optionsWin);
        }
        else {
            this.p = cp.spawn(this.command, this.args.concat(this.env), optionsUnix);
        }
        console.log('[vscode-elixir] server started', this.p);
        this.p.on('message', function (message) {
            console.log('message', message);
        });
        this.p.on('error', function (error) {
            console.log('[vscode-elixir]', error.toString());
        });
        this.p.on('close', function (exitCode) {
            console.log('[vscode-elixir] exited', exitCode);
        });
        this.p.stdout.on('data', function (chunk) {
            if (chunk.indexOf("END-OF-" + _this.lastRequestType) > -1) {
                var chunkString = chunk.toString();
                var splitStrings = chunkString.split("END-OF-" + _this.lastRequestType);
                var result = (_this.buffer + splitStrings[0]).trim();
                _this.resultCallback(result);
                _this.buffer = '';
                _this.busy = false;
            }
            else {
                _this.buffer += chunk.toString();
            }
        });
        this.p.stderr.on('data', function (chunk) {
            var errorString = chunk.toString();
            if (!errorString.startsWith('Initializing')) {
                console.log('[vscode-elixir] error: aborting command', chunk.toString());
                //TODO: this could be handled better.
                if (_this.resultCallback) {
                    _this.resultCallback('');
                }
                _this.busy = false;
            }
            else {
                console.log('[vscode-elixir]', chunk.toString());
                _this.ready = true;
            }
        });
    };
    ElixirServer.prototype.sendRequest = function (type, command, cb) {
        if (!this.busy && this.ready) {
            this.lastRequestType = type;
            if (process.platform === 'win32') {
                command = command.replace(/\\/g, '/');
            }
            console.log('[vscode-elixir] cmd: ', command);
            this.busy = true;
            this.resultCallback = cb;
            this.p.stdin.write(command);
        }
        else {
            console.log('[vscode-elixir] server is busy / not ready');
        }
    };
    ElixirServer.prototype.getDefinition = function (document, position, callback) {
        var wordAtPosition = document.getWordRangeAtPosition(position);
        var word = document.getText(wordAtPosition);
        if (word.indexOf('\n') >= 0) {
            console.error('[vscode-elixir] got whole file as word');
            callback([]);
            return;
        }
        var lookup = this.createDefinitionLookup(word);
        var command = "DEFL { \"" + lookup + "\", \"" + document.fileName + "\", \"" + document.fileName + "\", " + (position.line + 1) + " }\n";
        var resultCb = function (result) {
            if (process.platform === 'win32') {
                result = result.replace(/\//g, '\\');
            }
            callback(result);
        };
        this.sendRequest('DEFL', command, resultCb);
    };
    ElixirServer.prototype.getDocumentation = function (document, position, callback) {
        var wordAtPosition = document.getWordRangeAtPosition(position);
        var word = document.getText(wordAtPosition);
        if (word.indexOf('\n') >= 0) {
            console.error('[vscode-elixir] got whole file as word');
            callback([]);
            return;
        }
        var command = "DOCL { \"" + word + "\", \"" + document.fileName + "\", " + (position.line + 1) + " }\n";
        var resultCb = function (result) {
            if (result) {
                var hover = new vscode.Hover(result, wordAtPosition);
                callback(hover);
            }
            else {
                callback([]);
            }
        };
        this.sendRequest('DOCL', command, resultCb);
    };
    ElixirServer.prototype.createDefinitionLookup = function (word) {
        var _this = this;
        if (word.indexOf('.') >= 0) {
            var words = word.split('.');
            var lookup_1 = '';
            words.forEach(function (w) {
                if (lookup_1.length > 0) {
                    if (_this.isModuleName(w)) {
                        lookup_1 = lookup_1 + "." + w;
                    }
                    else {
                        lookup_1 = lookup_1 + "," + w;
                    }
                }
                else {
                    lookup_1 = w;
                }
            });
            if (lookup_1.indexOf(',') < 0) {
                lookup_1 = lookup_1 + ",nil";
            }
            return lookup_1;
        }
        else {
            if (this.isModuleName(word)) {
                return word + ",nil";
            }
            else {
                return "nil," + word;
            }
        }
    };
    ElixirServer.prototype.isModuleName = function (word) {
        return /^[A-Z]/.test(word);
    };
    ElixirServer.prototype.getCompletions = function (document, position, callback) {
        var _this = this;
        var wordAtPosition = document.getWordRangeAtPosition(position);
        var word = document.getText(wordAtPosition);
        if (word.indexOf('\n') >= 0) {
            console.error('[vscode-elixir] got whole file as word');
            callback([]);
            return;
        }
        var command = "COMP { \"" + word + "\", \"" + document.fileName + "\", " + (position.line + 1) + " }\n";
        var resultCb = function (result) {
            var suggestionLines = result.split('\n');
            // remove 'hint' suggestion (always the first one returned by alchemist)
            var hintLine = suggestionLines.shift();
            var completionItems = suggestionLines.map(function (line) {
                return _this.createCompletion(word, line, hintLine.startsWith(':'));
            });
            callback(completionItems);
        };
        this.sendRequest('COMP', command, resultCb);
    };
    ElixirServer.prototype.createCompletion = function (hint, line, isErlangModule) {
        if (isErlangModule === void 0) { isErlangModule = false; }
        var suggestion = line.split(';');
        var completionItem = new vscode.CompletionItem(suggestion[0]);
        completionItem.documentation = suggestion[suggestion.length - 2];
        switch (suggestion[1]) {
            case 'macro':
            case 'public_function':
            case 'function': {
                completionItem.kind = vscode.CompletionItemKind.Function;
                break;
            }
            case 'module': {
                completionItem.kind = vscode.CompletionItemKind.Module;
            }
        }
        completionItem.insertText = suggestion[0];
        if (suggestion[1] === 'module') {
            var name = suggestion[0], kind = suggestion[1], subtype = suggestion[2], desc = suggestion[3];
            var prefix = '';
            if (hint.indexOf('.') >= 0) {
                var lastIndex = hint.lastIndexOf('.');
                prefix = hint.substr(0, lastIndex + 1);
            }
            if (isErlangModule) {
                prefix = ':' + prefix;
            }
            completionItem.label = prefix + name;
            completionItem.insertText = prefix + name;
        }
        else {
            var name = suggestion[0], kind = suggestion[1], signature = suggestion[2], mod = suggestion[3], desc = suggestion[4], spec = suggestion[5];
            completionItem.detail = signature;
            var prefix = '';
            if (hint.indexOf('.') >= 0) {
                var lastIndex = hint.lastIndexOf('.');
                prefix = hint.substr(0, lastIndex + 1);
            }
            if (kind === 'function' || kind === 'macro' || kind === 'public_function') {
                if (name.indexOf('/') >= 0) {
                    name = name.split('/')[0];
                }
                //TODO: VSCode currently doesnt seem to support 'snippet completions'
                //      so adding the parameters to the Completion is not really useful.
                //completionItem.insertText = prefix + name + '(' + signature + ')';
                completionItem.insertText = prefix + name;
            }
            completionItem.label = prefix + name;
        }
        return completionItem;
    };
    ElixirServer.prototype.stop = function () {
        console.log('[vscode-elixir] stopping server');
        this.p.stdin.end();
    };
    return ElixirServer;
}());
exports.ElixirServer = ElixirServer;
//# sourceMappingURL=elixirServer.js.map