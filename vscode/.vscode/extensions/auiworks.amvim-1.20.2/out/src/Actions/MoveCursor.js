"use strict";
const vscode_1 = require("vscode");
const Reveal_1 = require("./Reveal");
const Position_1 = require("../Utils/Position");
class ActionMoveCursor {
    static blockUpdatePreferedColumn() {
        if (ActionMoveCursor.preferedColumnBlockTimer) {
            clearTimeout(ActionMoveCursor.preferedColumnBlockTimer);
        }
        ActionMoveCursor.isUpdatePreferedColumnBlocked = true;
        ActionMoveCursor.preferedColumnBlockTimer = setTimeout(function () {
            ActionMoveCursor.isUpdatePreferedColumnBlocked = false;
            ActionMoveCursor.preferedColumnBlockTimer = undefined;
        }, 100);
    }
    static updatePreferedColumn() {
        if (ActionMoveCursor.isUpdatePreferedColumnBlocked) {
            return Promise.resolve(false);
        }
        const activeTextEditor = vscode_1.window.activeTextEditor;
        if (!activeTextEditor) {
            return Promise.resolve(false);
        }
        ActionMoveCursor.preferedColumnBySelectionIndex =
            activeTextEditor.selections.map(selection => Position_1.UtilPosition.getColumn(activeTextEditor, selection.active));
        return Promise.resolve(true);
    }
    static byMotions(args) {
        args.isVisualMode = args.isVisualMode === undefined ? false : args.isVisualMode;
        args.isVisualLineMode = args.isVisualLineMode === undefined ? false : args.isVisualLineMode;
        args.noEmptyAtLineEnd = args.noEmptyAtLineEnd === undefined ? false : args.noEmptyAtLineEnd;
        const activeTextEditor = vscode_1.window.activeTextEditor;
        if (!activeTextEditor) {
            return Promise.resolve(false);
        }
        // Prevent prefered character update if no motion updates character.
        if (args.motions.every(motion => !motion.isCharacterUpdated)) {
            ActionMoveCursor.blockUpdatePreferedColumn();
        }
        const document = activeTextEditor.document;
        activeTextEditor.selections = activeTextEditor.selections.map((selection, i) => {
            let anchor;
            let active = args.motions.reduce((position, motion) => {
                return motion.apply(position, {
                    isInclusive: args.isVisualMode,
                    preferedColumn: ActionMoveCursor.preferedColumnBySelectionIndex[i]
                });
            }, selection.active);
            if (args.isVisualMode) {
                anchor = selection.anchor;
                if (anchor.isEqual(active)) {
                    if (active.isBefore(selection.active)) {
                        anchor = anchor.translate(0, +1);
                        if (active.character > 0) {
                            active = active.translate(0, -1);
                        }
                    }
                    else {
                        if (anchor.character > 0) {
                            anchor = anchor.translate(0, -1);
                        }
                        active = active.translate(0, +1);
                    }
                }
                else if (active.isAfter(anchor) && selection.active.isBefore(selection.anchor)) {
                    anchor = anchor.translate(0, -1);
                }
                else if (active.isBefore(anchor) && selection.active.isAfter(selection.anchor)) {
                    anchor = anchor.translate(0, +1);
                }
            }
            else if (args.isVisualLineMode) {
                anchor = selection.anchor;
                if (anchor.isBefore(active)) {
                    anchor = anchor.with(undefined, 0);
                    active = active.with(undefined, activeTextEditor.document.lineAt(active.line).text.length);
                }
                else {
                    anchor = anchor.with(undefined, activeTextEditor.document.lineAt(anchor.line).text.length);
                    active = active.with(undefined, 0);
                }
            }
            else {
                if (args.noEmptyAtLineEnd) {
                    const lineEndCharacter = document.lineAt(active.line).text.length;
                    if (lineEndCharacter !== 0 && active.character === lineEndCharacter) {
                        active = active.translate(0, -1);
                    }
                }
                anchor = active;
            }
            return new vscode_1.Selection(anchor, active);
        });
        return Reveal_1.ActionReveal.primaryCursor();
    }
}
ActionMoveCursor.preferedColumnBySelectionIndex = [];
ActionMoveCursor.isUpdatePreferedColumnBlocked = false;
exports.ActionMoveCursor = ActionMoveCursor;
//# sourceMappingURL=MoveCursor.js.map