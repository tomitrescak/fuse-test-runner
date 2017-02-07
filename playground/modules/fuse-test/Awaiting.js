"use strict";
const Exception_1 = require("./Exception");
const $nextTick = (fn) => {
    return setTimeout(() => {
        fn();
    }, 1);
};
class Awaiting {
    constructor() {
        this.timeSince = 0;
        this.timeStart = new Date().getTime();
    }
    start(successFn, rejectFn, timeout = 2000) {
        this.successFn = successFn;
        this.rejectFn = rejectFn;
        this.timeout = timeout;
        this.poll();
    }
    poll() {
        $nextTick(() => {
            this.timeSince = new Date().getTime() - this.timeStart;
            if (this.timeSince >= this.timeout) {
                this.resolveError(new Exception_1.Exception("Timeout error"));
            }
            if (this.rejectObject) {
                return this.rejectFn(this.rejectObject);
            }
            if (this.resolved) {
                return this.successFn(this.resolved);
            }
            else {
                this.poll();
            }
        });
    }
    reject(obj) {
        this.rejectObject = obj || { message: "Rejected" };
    }
    resolveSuccess() {
        this.resolved = {
            ms: this.timeSince,
            success: true
        };
    }
    resolveError(e) {
        this.resolved = {
            ms: this.timeSince,
            error: e || true
        };
    }
    resolve(obj) {
        this.resolved = obj;
    }
}
exports.Awaiting = Awaiting;
