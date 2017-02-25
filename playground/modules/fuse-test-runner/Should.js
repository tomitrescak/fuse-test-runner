"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Exception_1 = require("./Exception");
const realm_utils_1 = require("realm-utils");
class ShouldInstance {
    constructor(obj) {
        this.obj = obj;
    }
    equal(expected) {
        if (this.obj !== expected) {
            throw new Exception_1.Exception(`Expected ${this.obj} to equal ${expected}`);
        }
        return this;
    }
    notEqual(expected) {
        if (this.obj === expected) {
            throw new Exception_1.Exception(`Expected ${this.obj} to not equal ${expected}`);
        }
        return this;
    }
    match(exp) {
        this.beString();
        if (!exp.test(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to match ${exp}`);
        }
        return this;
    }
    findString(target) {
        this.beString();
        if (this.obj.indexOf(target) === -1) {
            throw new Exception_1.Exception(`Expected ${this.obj} to have ${target}`);
        }
        return this;
    }
    okay() {
        if (this.obj === undefined || this.obj === null) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be not undefined or null`);
        }
        return this;
    }
    haveLength(expected) {
        this.okay();
        if (this.obj.length === undefined) {
            throw new Exception_1.Exception(`Expected ${this.obj} to have length, got undefined`);
        }
        if (expected !== undefined) {
            if (this.obj.length !== expected) {
                throw new Exception_1.Exception(`Expected ${this.obj} to have length of ${expected}. Got ${this.obj.length}`);
            }
        }
        return this;
    }
    haveLengthGreater(expected) {
        this.haveLength();
        if (this.obj.length <= expected) {
            throw new Exception_1.Exception(`Expected ${this.obj} length be greater than ${expected}. Got ${this.obj.length}`);
        }
        return this;
    }
    haveLengthGreaterEqual(expected) {
        this.haveLength();
        if (!(this.obj.length >= expected)) {
            throw new Exception_1.Exception(`Expected ${this.obj} length be greater or equal than ${expected}. Got ${this.obj.length}`);
        }
        return this;
    }
    haveLengthLess(expected) {
        this.haveLength();
        if (!(this.obj.length < expected)) {
            throw new Exception_1.Exception(`Expected ${this.obj} length be less than ${expected}. Got ${this.obj.length}`);
        }
        return this;
    }
    haveLengthLessEqual(expected) {
        this.haveLength();
        if (!(this.obj.length <= expected)) {
            throw new Exception_1.Exception(`Expected ${this.obj} length be less or equal than ${expected}. Got ${this.obj.length}`);
        }
        return this;
    }
    throwException(fn) {
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
    deepEqual(expected) {
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
        const result = $deepEqual(this.obj, expected);
        if (result === false) {
            throw new Exception_1.Exception(`Expected the original
${JSON.stringify(this.obj, null, 2)} 
to be deep equal to 
${JSON.stringify(expected, null, 2)}`);
        }
        return this;
    }
    beString() {
        if (!realm_utils_1.utils.isString(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a string, Got ${typeof this.obj}`);
        }
        return this;
    }
    beArray() {
        if (!realm_utils_1.utils.isArray(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be an array, Got ${typeof this.obj}`);
        }
        return this;
    }
    beObject() {
        if (!realm_utils_1.utils.isObject(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be an obj, Got ${typeof this.obj}`);
        }
        return this;
    }
    bePlainObject() {
        if (!realm_utils_1.utils.isPlainObject(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a plain object, Got ${typeof this.obj}`);
        }
        return this;
    }
    bePromise() {
        if (!realm_utils_1.utils.isPromise(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a promise, Got ${typeof this.obj}`);
        }
        return this;
    }
    beFunction() {
        if (!realm_utils_1.utils.isFunction(this.obj)) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a function, Got ${typeof this.obj}`);
        }
        return this;
    }
    beNumber() {
        if (typeof this.obj !== "number") {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a number, Got ${typeof this.obj}`);
        }
        return this;
    }
    beBoolean() {
        if (typeof this.obj !== "boolean") {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a boolean, Got ${typeof this.obj}`);
        }
        return this;
    }
    beUndefined() {
        if (this.obj !== undefined) {
            throw new Exception_1.Exception(`Expected ${this.obj} to be a undefined, Got ${typeof this.obj}`);
        }
        return this;
    }
}
exports.ShouldInstance = ShouldInstance;
exports.should = (obj) => {
    return new ShouldInstance(obj);
};
