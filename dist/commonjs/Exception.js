"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
class Exception extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.Exception = Exception;
class SnapshotException extends Exception {
    constructor(message, expected, current, name) {
        super(message);
        this.message = message;
        this.expected = expected;
        this.current = current;
        this.name = name;
    }
}
exports.SnapshotException = SnapshotException;
