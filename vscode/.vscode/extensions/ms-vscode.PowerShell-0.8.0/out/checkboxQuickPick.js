/*---------------------------------------------------------
 * Copyright (C) Microsoft Corporation. All rights reserved.
 *--------------------------------------------------------*/
"use strict";
const vscode = require("vscode");
var confirmItemLabel = "$(checklist) Confirm";
var checkedPrefix = "[ $(check) ]";
var uncheckedPrefix = "[     ]";
var defaultPlaceHolder = "Select 'Confirm' to confirm or press 'Esc' key to cancel";
var defaultOptions = { confirmPlaceHolder: defaultPlaceHolder };
function showCheckboxQuickPick(items, options = defaultOptions) {
    return showInner(items, options).then((selectedItem) => {
        // We're mutating the original item list so just return it for now.
        // If 'selectedItem' is undefined it means the user cancelled the
        // inner showQuickPick UI so pass the undefined along.
        return selectedItem != undefined ? items : undefined;
    });
}
exports.showCheckboxQuickPick = showCheckboxQuickPick;
function getQuickPickItems(items) {
    let quickPickItems = [];
    quickPickItems.push({ label: confirmItemLabel, description: "" });
    items.forEach(item => quickPickItems.push({
        label: convertToCheckBox(item),
        description: item.description
    }));
    return quickPickItems;
}
function showInner(items, options) {
    var quickPickThenable = vscode.window.showQuickPick(getQuickPickItems(items), {
        ignoreFocusOut: true,
        matchOnDescription: true,
        placeHolder: options.confirmPlaceHolder
    });
    return quickPickThenable.then((selection) => {
        if (!selection) {
            //return Promise.reject<vscode.QuickPickItem>("showCheckBoxQuickPick cancelled")
            return Promise.resolve(undefined);
        }
        if (selection.label === confirmItemLabel) {
            return selection;
        }
        let index = getItemIndex(items, selection.label);
        if (index >= 0) {
            toggleSelection(items[index]);
        }
        else {
            console.log(`Couldn't find CheckboxQuickPickItem for label '${selection.label}'`);
        }
        return showInner(items, options);
    });
}
function getItemIndex(items, itemLabel) {
    var trimmedLabel = itemLabel.substr(itemLabel.indexOf("]") + 2);
    return items.findIndex(item => item.label === trimmedLabel);
}
function toggleSelection(item) {
    item.isSelected = !item.isSelected;
}
function convertToCheckBox(item) {
    return `${item.isSelected ? checkedPrefix : uncheckedPrefix} ${item.label}`;
}
//# sourceMappingURL=checkboxQuickPick.js.map