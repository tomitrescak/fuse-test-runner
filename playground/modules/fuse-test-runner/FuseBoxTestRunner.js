"use strict";
var __awaiter = (this && this.__awaiter) || function(thisArg, _arguments, P, generator) {
    return new(P || (P = Promise))(function(resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }

        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }

        function step(result) { result.done ? resolve(result.value) : new P(function(resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Awaiting_1 = require("./Awaiting");
const realm_utils_1 = require("realm-utils");
const Exception_1 = require("./Exception");
const Reporter_1 = require("./Reporter");
const Config_1 = require("./Config");
const systemProps = ["before", "beforeAll", "afterAll", 'beforeEach', 'after', 'afterEach'];
const $isSystemProp = (name) => {
    return systemProps.indexOf(name) > -1;
};
const $isPromise = (item) => {
    return item &&
        typeof item.then === 'function' &&
        typeof item.catch === 'function';
};
class FuseBoxTestRunner {
    constructor(opts) {
        this.startTime = new Date().getTime();
        this.doExit = false;
        this.failed = false;
        this.opts = opts;
        let reporterPath = opts.reporter || "fuse-test-reporter";
        let reportLib = typeof(opts.reporter) === 'string' ? require(reporterPath) : opts.reporter;
        this.doExit = FuseBox.isServer && opts.exit === true;
        if (reportLib.default) {
            this.reporter = new Reporter_1.Reporter(reportLib.default);
        } else {
            this.reporter = new Reporter_1.Reporter(reportLib);
        }
    }
    finish() {
        return __awaiter(this, void 0, void 0, function*() {
            if (this.opts.afterAll) {
                yield this.opts.afterAll(Config_1.TestConfig, this);
            }
            if (this.doExit) {
                process.exit(this.failed ? 1 : 0);
            }
        });
    }
    start() {
        return __awaiter(this, void 0, void 0, function*() {
            const tests = FuseBox.import("*.test.js");
            if (this.opts.beforeAll) {
                yield this.opts.beforeAll(Config_1.TestConfig, this);
            }
            return this.startTests(tests);
        });
    }
    startTests(tests) {
        this.reporter.initialize(tests);
        return realm_utils_1.each(tests, (moduleExports, name) => {
            return this.startFile(name, moduleExports);
        }).then((res) => {
            const reportResult = this.reporter.endTest(res, new Date().getTime() - this.startTime);
            if (realm_utils_1.utils.isPromise(reportResult)) {
                reportResult.then(x => this.finish())
                    .catch(e => {
                        console.error(e.stack || e);
                    });
            } else {
                this.finish();
            }
        }).catch(e => {
            console.log(e.stack || e);
        });
    }
    convertToReadableName(str) {
        if (str.match(/\s+/)) {
            return str;
        }
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
            } else {
                if (char.toUpperCase() === char) {
                    addWord();
                    word = [char];
                } else {
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
            } else {
                if (typeof obj[propertyName] === "function") {
                    instructions[propertyName] = true;
                }
            }
        }
        return instructions;
    }
    hasCallback(func) {
        return /^(function\s*)?([a-zA-Z0-9$_]+\s*)?\((.+)\)/.test(func.toString());
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
                } else {
                    let result;
                    try {
                        result = func();
                    } catch (e) {
                        return awaiter.resolveError(e);
                    }
                    if ($isPromise(result)) {
                        return result.then(() => {
                            awaiter.resolveSuccess();
                        }).catch((e) => {
                            awaiter.resolveError(e);
                        });
                    } else {
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
            if (key[0] === "_") {
                return;
            }
            report[key] = {
                title: this.convertToReadableName(key),
                items: [],
                cls: obj
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
                    fn: this.createEvalFunction(instance, methodName),
                    instance,
                    cls: obj
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
                Config_1.TestConfig.currentTask = item;
                Config_1.TestConfig.currentTask.fileName = filename;
                Config_1.TestConfig.currentTask.className = className;
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