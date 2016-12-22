'use strict';
const vscode_1 = require('vscode');
const DocumentWatcher_1 = require('./DocumentWatcher');
const generateEditorConfig_1 = require('./commands/generateEditorConfig');
/**
 * Main entry
 */
function activate(ctx) {
    ctx.subscriptions.push(new DocumentWatcher_1.default());
    // register a command handler to generate a .editorconfig file
    vscode_1.commands.registerCommand('vscode.generateeditorconfig', generateEditorConfig_1.generateEditorConfig);
}
exports.activate = activate;
//# sourceMappingURL=editorConfigMain.js.map