"use strict";
class Exception extends Error {
    constructor(message) {
        super(message);
        this.message = message;
    }
}
exports.Exception = Exception;
