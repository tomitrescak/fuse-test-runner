"use strict";
const Awaiting_1 = require("./Awaiting");
const realm_utils_1 = require("realm-utils");
const Exception_1 = require("./Exception");
const Reporter_1 = require("./Reporter");
const systemProps = ["before", "beforeAll", "afterAll", 'beforeEach', 'after', 'afterEach'];
const $isSystemProp = (name) => {
    return systemProps.indexOf(name) > -1;
};
const $isPromise = (item) => {
    return item
        && typeof item.then === 'function' &&
        typeof item.catch === 'function';
};
class FuseBoxTestRunner {
    constructor(opts) {
        this.startTime = new Date().getTime();
        this.doExit = false;
        this.failed = false;
        let reporterPath = opts.reporterPath || "fuse-test-reporter";
        let reportLib = FuseBox.import(reporterPath);
        this.doExit = FuseBox.isServer && opts.exit === true;
        if (reportLib.default) {
            this.reporter = new Reporter_1.Reporter(reportLib.default);
        }
    }
    finish() {
        if (this.doExit) {
            process.exit(this.failed ? 1 : 0);
        }
    }
    start() {
        const tests = FuseBox.import("*.test.js");
        this.reporter.initialize(tests);
        return realm_utils_1.each(tests, (moduleExports, name) => {
            return this.startFile(name, moduleExports);
        }).then((res) => {
            const reportResult = this.reporter.endTest(res, new Date().getTime() - this.startTime);
            if (realm_utils_1.utils.isPromise(reportResult)) {
                reportResult.then(x => this.finish())
                    .catch(e => {
                    console.error(e);
                });
            }
            else {
                this.finish();
            }
        }).catch(e => {
            console.log(e);
        });
    }
    convertToReadableName(str) {
        let prev;
        let word = [];
        let words = [];
        let addWord = () => {
            if (word.length) {
                words.push(word.join('').toLowerCase());
            }
        };
        for (let i = 0; i < str.length; i++) {
            let char = str.charAt(i);
            if (char === "_" || char === " ") {
                if (word.length) {
                    addWord();
                    word = [];
                }
            }
            else {
                if (char.toUpperCase() === char) {
                    addWord();
                    word = [char];
                }
                else {
                    word.push(char);
                }
                if (i == str.length - 1) {
                    addWord();
                }
            }
        }
        let sentence = words.join(' ');
        return sentence.charAt(0).toUpperCase() + sentence.slice(1);
    }
    extractInstructions(obj) {
        let props = Object.getOwnPropertyNames(obj.constructor.prototype);
        let instructions = {
            methods: [],
            suites: {}
        };
        if (realm_utils_1.utils.isPlainObject(obj.suites)) {
            instructions.suites = obj.suites;
        }
        for (var i = 1; i < props.length; i++) {
            let propertyName = props[i];
            if (systemProps.indexOf(propertyName) == -1) {
                instructions.methods.push(propertyName);
            }
            else {
                if (typeof obj[propertyName] === "function") {
                    instructions[propertyName] = true;
                }
            }
        }
        return instructions;
    }
    hasCallback(func) {
        return /^(function\s*)?([a-z0-9$_]+\s*)?\((.+)\)/.test(func.toString());
    }
    createEvalFunction(obj, method) {
        return () => {
            return new Promise((resolve, reject) => {
                let awaiter = new Awaiting_1.Awaiting();
                awaiter.start(resolve, reject);
                const func = obj[method];
                const hasCallback = this.hasCallback(func);
                if (hasCallback) {
                    func((error) => {
                        if (error) {
                            return awaiter.resolveError(error);
                        }
                        return awaiter.resolveSuccess();
                    });
                }
                else {
                    let result;
                    try {
                        result = func();
                    }
                    catch (e) {
                        return awaiter.resolveError(e);
                    }
                    if ($isPromise(result)) {
                        return result.then(() => {
                            awaiter.resolveSuccess();
                        }).catch((e) => {
                            awaiter.resolveError(e);
                        });
                    }
                    else {
                        return awaiter.resolveSuccess();
                    }
                }
            });
        };
    }
    startFile(filename, moduleExports) {
        const report = {};
        this.reporter.startFile(filename);
        return realm_utils_1.each(moduleExports, (obj, key) => {
            report[key] = {
                title: this.convertToReadableName(key),
                items: []
            };
            this.reporter.startClass(filename, report[key]);
            return this.createTasks(filename, key, obj).then(items => {
                report[key].tasks = items;
            }).then(() => {
                this.reporter.endClass(filename, report[key]);
            });
        }).then(() => {
            return report;
        });
    }
    createTasks(filename, className, obj) {
        let instance = new obj();
        let instructions = this.extractInstructions(instance);
        let tasks = [];
        if (instructions["before"]) {
            tasks.push({
                method: "before",
                fn: this.createEvalFunction(instance, "before")
            });
        }
        instructions.methods.forEach(methodName => {
            if (!$isSystemProp(methodName)) {
                if (instructions["beforeEach"]) {
                    tasks.push({
                        method: "beforeEach",
                        fn: this.createEvalFunction(instance, "beforeEach")
                    });
                }
                tasks.push({
                    method: methodName,
                    title: this.convertToReadableName(methodName),
                    fn: this.createEvalFunction(instance, methodName)
                });
                if (instructions["afterEach"]) {
                    tasks.push({
                        method: "afterEach",
                        fn: this.createEvalFunction(instance, "afterEach")
                    });
                }
            }
        });
        if (instructions["after"]) {
            tasks.push({
                method: "after",
                fn: this.createEvalFunction(instance, "after")
            });
        }
        return this.runTasks(filename, className, tasks);
    }
    runTasks(filename, className, tasks) {
        const size = tasks.length;
        let current = 0;
        return realm_utils_1.each(tasks, (item) => {
            return new Promise((resolve, reject) => {
                return item.fn().then((data) => {
                    let report = {
                        item: item,
                        data: data
                    };
                    if (!data.success) {
                        this.failed = true;
                    }
                    if (!$isSystemProp(item.method)) {
                        this.reporter.testCase(report);
                    }
                    return resolve(report);
                }).catch((e) => {
                    let error;
                    if (e instanceof Exception_1.Exception) {
                        error = e;
                        error.filename = filename;
                        error.className = className;
                        error.methodName = item.method;
                        error.title = item.title;
                    }
                    let report = {
                        item: item,
                        error: error || e
                    };
                    this.reporter.testCase(report);
                    return resolve(report);
                });
            });
        });
    }
}
exports.FuseBoxTestRunner = FuseBoxTestRunner;
