/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode = require("vscode");
const checkboxQuickPick_1 = require("../checkboxQuickPick");
var EvaluateRequest;
(function (EvaluateRequest) {
    EvaluateRequest.type = { get method() { return 'evaluate'; } };
})(EvaluateRequest = exports.EvaluateRequest || (exports.EvaluateRequest = {}));
var OutputNotification;
(function (OutputNotification) {
    OutputNotification.type = { get method() { return 'output'; } };
})(OutputNotification = exports.OutputNotification || (exports.OutputNotification = {}));
var ShowChoicePromptRequest;
(function (ShowChoicePromptRequest) {
    ShowChoicePromptRequest.type = { get method() { return 'powerShell/showChoicePrompt'; } };
})(ShowChoicePromptRequest = exports.ShowChoicePromptRequest || (exports.ShowChoicePromptRequest = {}));
var ShowInputPromptRequest;
(function (ShowInputPromptRequest) {
    ShowInputPromptRequest.type = { get method() { return 'powerShell/showInputPrompt'; } };
})(ShowInputPromptRequest = exports.ShowInputPromptRequest || (exports.ShowInputPromptRequest = {}));
function showChoicePrompt(promptDetails, client) {
    var resultThenable = undefined;
    if (!promptDetails.isMultiChoice) {
        var quickPickItems = promptDetails.choices.map(choice => {
            return {
                label: choice.label,
                description: choice.helpMessage
            };
        });
        if (promptDetails.defaultChoices &&
            promptDetails.defaultChoices.length > 0) {
            // Shift the default items to the front of the
            // array so that the user can select it easily
            var defaultChoice = promptDetails.defaultChoices[0];
            if (defaultChoice > -1 &&
                defaultChoice < promptDetails.choices.length) {
                var defaultChoiceItem = quickPickItems[defaultChoice];
                quickPickItems.splice(defaultChoice, 1);
                // Add the default choice to the head of the array
                quickPickItems = [defaultChoiceItem].concat(quickPickItems);
            }
        }
        resultThenable =
            vscode.window
                .showQuickPick(quickPickItems, { placeHolder: promptDetails.caption + " - " + promptDetails.message })
                .then(onItemSelected);
    }
    else {
        var checkboxQuickPickItems = promptDetails.choices.map(choice => {
            return {
                label: choice.label,
                description: choice.helpMessage,
                isSelected: false
            };
        });
        // Select the defaults
        promptDetails.defaultChoices.forEach(choiceIndex => {
            checkboxQuickPickItems[choiceIndex].isSelected = true;
        });
        resultThenable =
            checkboxQuickPick_1.showCheckboxQuickPick(checkboxQuickPickItems, { confirmPlaceHolder: `${promptDetails.caption} - ${promptDetails.message}` })
                .then(onItemsSelected);
    }
    return resultThenable;
}
function showInputPrompt(promptDetails, client) {
    var resultThenable = vscode.window.showInputBox({
        placeHolder: promptDetails.name + ": "
    }).then(onInputEntered);
    return resultThenable;
}
function onItemsSelected(chosenItems) {
    if (chosenItems !== undefined) {
        return {
            promptCancelled: false,
            responseText: chosenItems.filter(item => item.isSelected).map(item => item.label).join(", ")
        };
    }
    else {
        // User cancelled the prompt, send the cancellation
        return {
            promptCancelled: true,
            responseText: undefined
        };
    }
}
function onItemSelected(chosenItem) {
    if (chosenItem !== undefined) {
        return {
            promptCancelled: false,
            responseText: chosenItem.label
        };
    }
    else {
        // User cancelled the prompt, send the cancellation
        return {
            promptCancelled: true,
            responseText: undefined
        };
    }
}
function onInputEntered(responseText) {
    if (responseText !== undefined) {
        return {
            promptCancelled: false,
            responseText: responseText
        };
    }
    else {
        return {
            promptCancelled: true,
            responseText: undefined
        };
    }
}
class ConsoleFeature {
    constructor() {
        this.commands = [
            vscode.commands.registerCommand('PowerShell.RunSelection', () => {
                if (this.languageClient === undefined) {
                    // TODO: Log error message
                    return;
                }
                var editor = vscode.window.activeTextEditor;
                var selectionRange = undefined;
                if (!editor.selection.isEmpty) {
                    selectionRange =
                        new vscode.Range(editor.selection.start, editor.selection.end);
                }
                else {
                    selectionRange = editor.document.lineAt(editor.selection.start.line).range;
                }
                this.languageClient.sendRequest(EvaluateRequest.type, {
                    expression: editor.document.getText(selectionRange)
                });
                // Show the output window if it isn't already visible
                this.consoleChannel.show(vscode.ViewColumn.Three);
            }),
            vscode.commands.registerCommand('PowerShell.ShowSessionOutput', () => {
                // Show the output window if it isn't already visible
                this.consoleChannel.show(vscode.ViewColumn.Three);
            })
        ];
        this.consoleChannel = vscode.window.createOutputChannel("PowerShell Output");
    }
    setLanguageClient(languageClient) {
        this.languageClient = languageClient;
        this.languageClient.onRequest(ShowChoicePromptRequest.type, promptDetails => showChoicePrompt(promptDetails, this.languageClient));
        this.languageClient.onRequest(ShowInputPromptRequest.type, promptDetails => showInputPrompt(promptDetails, this.languageClient));
        this.languageClient.onNotification(OutputNotification.type, (output) => {
            this.consoleChannel.append(output.output);
        });
    }
    dispose() {
        this.commands.forEach(command => command.dispose());
        this.consoleChannel.dispose();
    }
}
exports.ConsoleFeature = ConsoleFeature;
//# sourceMappingURL=Console.js.map