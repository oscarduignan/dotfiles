/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
'use strict';
const vscode = require("vscode");
const logging_1 = require("./logging");
const session_1 = require("./session");
const utils_1 = require("./utils");
const Console_1 = require("./features/Console");
const OpenInISE_1 = require("./features/OpenInISE");
const NewFileOrProject_1 = require("./features/NewFileOrProject");
const ExpandAlias_1 = require("./features/ExpandAlias");
const ShowOnlineHelp_1 = require("./features/ShowOnlineHelp");
const PowerShellFindModule_1 = require("./features/PowerShellFindModule");
const ExtensionCommands_1 = require("./features/ExtensionCommands");
const SelectPSSARules_1 = require("./features/SelectPSSARules");
const CodeActions_1 = require("./features/CodeActions");
// NOTE: We will need to find a better way to deal with the required
//       PS Editor Services version...
var requiredEditorServicesVersion = "0.8.0";
var logger = undefined;
var sessionManager = undefined;
var extensionFeatures = [];
function activate(context) {
    vscode.languages.setLanguageConfiguration(utils_1.PowerShellLanguageId, {
        wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\%\^\&\*\(\)\=\+\[\{\]\}\\\|\;\'\"\,\.\<\>\/\?\s]+)/g,
        indentationRules: {
            // ^(.*\*/)?\s*\}.*$
            decreaseIndentPattern: /^(.*\*\/)?\s*\}.*$/,
            // ^.*\{[^}"']*$
            increaseIndentPattern: /^.*\{[^}"']*$/
        },
        comments: {
            lineComment: '#',
            blockComment: ['<#', '#>']
        },
        brackets: [
            ['{', '}'],
            ['[', ']'],
            ['(', ')'],
        ],
        onEnterRules: [
            {
                // e.g. /** | */
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                afterText: /^\s*\*\/$/,
                action: { indentAction: vscode.IndentAction.IndentOutdent, appendText: ' * ' }
            },
            {
                // e.g. /** ...|
                beforeText: /^\s*\/\*\*(?!\/)([^\*]|\*(?!\/))*$/,
                action: { indentAction: vscode.IndentAction.None, appendText: ' * ' }
            },
            {
                // e.g.  * ...|
                beforeText: /^(\t|(\ \ ))*\ \*(\ ([^\*]|\*(?!\/))*)?$/,
                action: { indentAction: vscode.IndentAction.None, appendText: '* ' }
            },
            {
                // e.g.  */|
                beforeText: /^(\t|(\ \ ))*\ \*\/\s*$/,
                action: { indentAction: vscode.IndentAction.None, removeText: 1 }
            },
            {
                // e.g.  *-----*/|
                beforeText: /^(\t|(\ \ ))*\ \*[^/]*\*\/\s*$/,
                action: { indentAction: vscode.IndentAction.None, removeText: 1 }
            }
        ]
    });
    // Create the logger
    logger = new logging_1.Logger();
    // Create features
    extensionFeatures = [
        new Console_1.ConsoleFeature(),
        new OpenInISE_1.OpenInISEFeature(),
        new ExpandAlias_1.ExpandAliasFeature(),
        new ShowOnlineHelp_1.ShowHelpFeature(),
        new PowerShellFindModule_1.FindModuleFeature(),
        new ExtensionCommands_1.ExtensionCommandsFeature(),
        new SelectPSSARules_1.SelectPSSARulesFeature(),
        new CodeActions_1.CodeActionsFeature(),
        new NewFileOrProject_1.NewFileOrProjectFeature()
    ];
    sessionManager =
        new session_1.SessionManager(requiredEditorServicesVersion, logger, extensionFeatures);
    sessionManager.start();
}
exports.activate = activate;
function deactivate() {
    // Clean up all extension features
    extensionFeatures.forEach(feature => {
        feature.dispose();
    });
    // Dispose of the current session
    sessionManager.dispose();
    // Dispose of the logger
    logger.dispose();
}
exports.deactivate = deactivate;
//# sourceMappingURL=main.js.map