"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const realm_utils_1 = require("realm-utils");
class Reporter {
    constructor(target) {
        this.target = target;
        if (target) {
            this.userReporter = new target();
        }
    }
    proxy(name, args) {
        let properArgs = [];
        for (let i in args) {
            if (args.hasOwnProperty(i)) {
                properArgs.push(args[i]);
            }
        }
        if (this.userReporter && realm_utils_1.utils.isFunction(this.userReporter[name])) {
            this.userReporter[name].apply(this.userReporter, properArgs);
        }
    }
    initialize(...args) {
        this.proxy("initialize", args);
    }
    startFile(...args) {
        this.proxy("startFile", args);
    }
    endTest(...args) {
        return this.proxy("endTest", args);
    }
    endFile(...args) {
        this.proxy("endFIle", args);
    }
    startClass(...args) {
        this.proxy("startClass", args);
    }
    endClass(...args) {
        this.proxy("endClass", args);
    }
    testCase(report) {
        this.proxy("testCase", arguments);
    }
}
exports.Reporter = Reporter;
