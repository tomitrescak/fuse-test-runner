"use strict";
const Exception_1 = require("./Exception");
class Should {
    static equal(original, expected) {
        if (original !== expected) {
            throw new Exception_1.Exception(`Expected ${original} to equal ${expected}`);
        }
    }
    static notEqual(original, expected) {
        if (original === expected) {
            throw new Exception_1.Exception(`Expected ${original} to not equal ${expected}`);
        }
    }
    static lengthBeEqual(original, expected) {
        if (!original || original.length === undefined) {
            throw new Exception_1.Exception(`Expected ${original} to have length object. Found undefined`);
        }
        if (original.length !== expected) {
            throw new Exception_1.Exception(`Expected ${original} to have length of ${expected}. Got ${original.length}`);
        }
    }
    static throwException(fn) {
        try {
            fn();
            throw { __exception_test__: true };
        }
        catch (e) {
            if (e && e.__exception_test__) {
                throw new Exception_1.Exception(`Expected exception did not occur`);
            }
        }
    }
    static deepEqual(original, expected) {
        function $deepEqual(a, b) {
            if ((typeof a == 'object' && a != null) &&
                (typeof b == 'object' && b != null)) {
                var count = [0, 0];
                for (var key in a)
                    count[0]++;
                for (var key in b)
                    count[1]++;
                if (count[0] - count[1] != 0) {
                    return false;
                }
                for (var key in a) {
                    if (!(key in b) || !$deepEqual(a[key], b[key])) {
                        return false;
                    }
                }
                for (var key in b) {
                    if (!(key in a) || !$deepEqual(b[key], a[key])) {
                        return false;
                    }
                }
                return true;
            }
            else {
                return a === b;
            }
        }
        const result = $deepEqual(original, expected);
        if (result === false) {
            throw new Exception_1.Exception(`Expected the original
${JSON.stringify(original, null, 2)} 
to be deep equal to 
${JSON.stringify(expected, null, 2)}`);
        }
    }
}
exports.Should = Should;
