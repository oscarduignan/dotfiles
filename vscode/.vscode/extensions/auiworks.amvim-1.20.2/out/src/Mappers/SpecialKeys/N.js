"use strict";
const Generic_1 = require("../Generic");
class SpecialKeyN {
    constructor() {
        this.indicator = '{N}';
        this.conflictRegExp = /^[1-9]|\{motion\}|\{textObject\}|\{char\}$/;
    }
    unmapConflicts(node, keyToMap) {
        if (keyToMap === this.indicator) {
            Object.getOwnPropertyNames(node).forEach(key => {
                this.conflictRegExp.test(key) && delete node[key];
            });
        }
        if (this.conflictRegExp.test(keyToMap)) {
            delete node[this.indicator];
        }
    }
    matchSpecial(inputs) {
        if (!/[1-9]/.test(inputs[0])) {
            return null;
        }
        let n = [inputs[0]];
        inputs.slice(1).every(input => {
            if (/[0-9]/.test(input)) {
                n.push(input);
                return true;
            }
            return false;
        });
        return {
            specialKey: this,
            kind: Generic_1.MatchResultKind.FOUND,
            matchedCount: n.length,
            additionalArgs: { n: parseInt(n.join(''), 10) }
        };
    }
}
exports.SpecialKeyN = SpecialKeyN;
//# sourceMappingURL=N.js.map