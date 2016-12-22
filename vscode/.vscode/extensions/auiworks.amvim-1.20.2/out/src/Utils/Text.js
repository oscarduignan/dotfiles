"use strict";
class UtilText {
    static switchCase(from) {
        let to = '';
        for (let i = 0; i < from.length; i++) {
            const charCode = from.charCodeAt(i);
            if (charCode >= 97 && charCode <= 122) {
                to += String.fromCharCode(charCode - 32);
            }
            else if (charCode >= 65 && charCode <= 90) {
                to += String.fromCharCode(charCode + 32);
            }
            else {
                to += from[i];
            }
        }
        return to;
    }
    static countStringAppearance(searchString, text) {
        let count = 0;
        let position = -1;
        while (true) {
            position = text.indexOf(searchString, position + 1);
            if (position < 0) {
                break;
            }
            count++;
        }
        return count;
    }
    static getLineCount(text) {
        return UtilText.countStringAppearance('\n', text) + 1;
    }
}
exports.UtilText = UtilText;
//# sourceMappingURL=Text.js.map