"use strict";
const Generic_1 = require("../Generic");
const N_1 = require("./N");
const Char_1 = require("./Char");
const Character_1 = require("../../Motions/Character");
const Direction_1 = require("../../Motions/Direction");
const Word_1 = require("../../Motions/Word");
const Match_1 = require("../../Motions/Match");
const MatchPair_1 = require("../../Motions/MatchPair");
const Line_1 = require("../../Motions/Line");
const Document_1 = require("../../Motions/Document");
class SpecialKeyMotion extends Generic_1.GenericMapper {
    constructor() {
        super([
            new N_1.SpecialKeyN(),
            new Char_1.SpecialKeyChar(),
        ]);
        this.indicator = '{motion}';
        this.conflictRegExp = /^[1-9]|\{N\}|\{char\}$/;
        this.maps = [
            { keys: 'h', motionGenerators: [Character_1.MotionCharacter.left] },
            { keys: '{N} h', motionGenerators: [Character_1.MotionCharacter.left] },
            { keys: 'left', motionGenerators: [Character_1.MotionCharacter.left] },
            { keys: '{N} left', motionGenerators: [Character_1.MotionCharacter.left] },
            { keys: 'l', motionGenerators: [Character_1.MotionCharacter.right] },
            { keys: '{N} l', motionGenerators: [Character_1.MotionCharacter.right] },
            { keys: 'right', motionGenerators: [Character_1.MotionCharacter.right] },
            { keys: '{N} right', motionGenerators: [Character_1.MotionCharacter.right] },
            { keys: 'k', motionGenerators: [Character_1.MotionCharacter.up] },
            { keys: '{N} k', motionGenerators: [Character_1.MotionCharacter.up] },
            { keys: 'up', motionGenerators: [Character_1.MotionCharacter.up] },
            { keys: '{N} up', motionGenerators: [Character_1.MotionCharacter.up] },
            { keys: 'j', motionGenerators: [Character_1.MotionCharacter.down] },
            { keys: '{N} j', motionGenerators: [Character_1.MotionCharacter.down] },
            { keys: 'down', motionGenerators: [Character_1.MotionCharacter.down] },
            { keys: '{N} down', motionGenerators: [Character_1.MotionCharacter.down] },
            { keys: 'w', motionGenerators: [Word_1.MotionWord.nextStart] },
            { keys: '{N} w', motionGenerators: [Word_1.MotionWord.nextStart] },
            { keys: 'W', motionGenerators: [Word_1.MotionWord.nextStart], args: { useBlankSeparatedStyle: true } },
            { keys: '{N} W', motionGenerators: [Word_1.MotionWord.nextStart], args: { useBlankSeparatedStyle: true } },
            { keys: 'e', motionGenerators: [Word_1.MotionWord.nextEnd] },
            { keys: '{N} e', motionGenerators: [Word_1.MotionWord.nextEnd] },
            { keys: 'E', motionGenerators: [Word_1.MotionWord.nextEnd], args: { useBlankSeparatedStyle: true } },
            { keys: '{N} E', motionGenerators: [Word_1.MotionWord.nextEnd], args: { useBlankSeparatedStyle: true } },
            { keys: 'b', motionGenerators: [Word_1.MotionWord.prevStart] },
            { keys: '{N} b', motionGenerators: [Word_1.MotionWord.prevStart] },
            { keys: 'B', motionGenerators: [Word_1.MotionWord.prevStart], args: { useBlankSeparatedStyle: true } },
            { keys: '{N} B', motionGenerators: [Word_1.MotionWord.prevStart], args: { useBlankSeparatedStyle: true } },
            { keys: 'f {char}', motionGenerators: [Match_1.MotionMatch.next] },
            { keys: 'F {char}', motionGenerators: [Match_1.MotionMatch.prev] },
            { keys: 't {char}', motionGenerators: [Match_1.MotionMatch.next], args: { isTill: true } },
            { keys: 'T {char}', motionGenerators: [Match_1.MotionMatch.prev], args: { isTill: true } },
            { keys: '%', motionGenerators: [MatchPair_1.MotionMatchPair.matchPair] },
            { keys: '^', motionGenerators: [Line_1.MotionLine.firstNonBlank] },
            { keys: '0', motionGenerators: [Line_1.MotionLine.start] },
            { keys: '$', motionGenerators: [Line_1.MotionLine.end] },
            { keys: '-', motionGenerators: [Character_1.MotionCharacter.up, Line_1.MotionLine.firstNonBlank] },
            { keys: '{N} -', motionGenerators: [Character_1.MotionCharacter.up, Line_1.MotionLine.firstNonBlank] },
            { keys: '+', motionGenerators: [Character_1.MotionCharacter.down, Line_1.MotionLine.firstNonBlank] },
            { keys: '{N} +', motionGenerators: [Character_1.MotionCharacter.down, Line_1.MotionLine.firstNonBlank] },
            { keys: '_', motionGenerators: [Line_1.MotionLine.firstNonBlank] },
            { keys: '{N} _', motionGenerators: [
                    (args) => Character_1.MotionCharacter.down({ n: args.n - 1 }),
                    Line_1.MotionLine.firstNonBlank
                ] },
            { keys: 'g g', motionGenerators: [Document_1.MotionDocument.toLine, Line_1.MotionLine.firstNonBlank], args: { n: 1 } },
            { keys: '{N} g g', motionGenerators: [Document_1.MotionDocument.toLine, Line_1.MotionLine.firstNonBlank] },
            { keys: 'G', motionGenerators: [Document_1.MotionDocument.toLine, Line_1.MotionLine.firstNonBlank], args: { n: +Infinity } },
            { keys: '{N} G', motionGenerators: [Document_1.MotionDocument.toLine, Line_1.MotionLine.firstNonBlank] },
            { keys: 'space', motionGenerators: [Direction_1.MotionDirection.next] },
            { keys: '{N} space', motionGenerators: [Direction_1.MotionDirection.next] },
            { keys: 'backspace', motionGenerators: [Direction_1.MotionDirection.previous] },
            { keys: '{N} backspace', motionGenerators: [Direction_1.MotionDirection.previous] },
        ];
        this.maps.forEach(map => {
            this.map(map.keys, map.motionGenerators, map.args);
        });
    }
    map(joinedKeys, motionGenerators, args) {
        const map = super.map(joinedKeys, args);
        map.motionGenerators = motionGenerators;
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
        // This class has lower priority than other keys.
    }
    matchSpecial(inputs) {
        const { kind, map } = this.match(inputs);
        if (kind === Generic_1.MatchResultKind.FAILED) {
            return null;
        }
        let additionalArgs = {};
        if (map) {
            additionalArgs.motions = map.motionGenerators.map(generator => generator(map.args));
        }
        return {
            specialKey: this,
            kind,
            matchedCount: inputs.length,
            additionalArgs
        };
    }
}
exports.SpecialKeyMotion = SpecialKeyMotion;
//# sourceMappingURL=Motion.js.map