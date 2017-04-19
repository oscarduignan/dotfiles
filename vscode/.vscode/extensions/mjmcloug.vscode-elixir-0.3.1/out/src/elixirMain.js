"use strict";
var vscode = require('vscode');
var elixirAutocomplete_1 = require('./elixirAutocomplete');
var elixirServer_1 = require('./elixirServer');
var elixirDefinitionProvider_1 = require('./elixirDefinitionProvider');
var elixirHoverProvider_1 = require('./elixirHoverProvider');
var elixirConfiguration_1 = require('./elixirConfiguration');
var ELIXIR_MODE = { language: 'elixir', scheme: 'file' };
var elixirServer;
function activate(ctx) {
    this.elixirServer = new elixirServer_1.ElixirServer();
    this.elixirServer.start();
    ctx.subscriptions.push(vscode.languages.registerCompletionItemProvider(ELIXIR_MODE, new elixirAutocomplete_1.ElixirAutocomplete(this.elixirServer), '.'));
    ctx.subscriptions.push(vscode.languages.registerDefinitionProvider(ELIXIR_MODE, new elixirDefinitionProvider_1.ElixirDefinitionProvider(this.elixirServer)));
    ctx.subscriptions.push(vscode.languages.registerHoverProvider(ELIXIR_MODE, new elixirHoverProvider_1.ElixirHoverProvider(this.elixirServer)));
    ctx.subscriptions.push(vscode.languages.setLanguageConfiguration('elixir', elixirConfiguration_1.configuration));
}
exports.activate = activate;
function deactivate() {
    this.elixirServer.stop();
}
exports.deactivate = deactivate;
//# sourceMappingURL=elixirMain.js.map