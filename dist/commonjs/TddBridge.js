"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function setupBridge() {
    const glob = global;
    let exp;
    let describeStack = [];
    glob.describe = function (name, impl) {
        describeStack.push(name);
        if (describeStack.length == 1) {
            exp = new Function('return function ' + name + '(){}')();
            glob.fuseExport = exp;
        }
        try {
            impl();
        }
        finally {
            describeStack.pop();
        }
    };
    glob.it = function (name, impl) {
        const fullName = describeStack.length > 1 ? `${describeStack.slice(1).join(' > ')} > ${name}` : name;
        exp.prototype[fullName] = impl;
    };
    glob.config = function (obj) {
        const con = obj;
        for (let name of Object.getOwnPropertyNames(con)) {
            if (name != 'constructor') {
                exp.prototype[name] = con[name];
            }
        }
    };
    glob.before = function (impl) {
        exp.prototype.before = impl;
    };
    glob.beforeAll = function (impl) {
        exp.prototype.beforeAll = impl;
    };
    glob.beforeEach = function (impl) {
        exp.prototype.beforeEach = impl;
    };
    glob.after = function (impl) {
        exp.prototype.after = impl;
    };
    glob.afterAll = function (impl) {
        exp.prototype.afterAll = impl;
    };
    glob.afterEach = function (impl) {
        exp.prototype.afterEach = impl;
    };
}
exports.setupBridge = setupBridge;
