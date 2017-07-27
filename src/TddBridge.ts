
import { TestConfig } from './Config';

export function setupBridge() {
  const glob = global as any;

  let exp;
  let describeStack = [];

  glob.describe = function(name: string, impl: Function) {
    describeStack.push(name);
    if (describeStack.length == 1) {
      exp = new Function('return function ' + name + '(){}')();
      // exp.name = name;
      glob.fuseExport = exp;
    }

    try {
      impl();
    } finally {
      describeStack.pop();
    }
  };

  glob.it = function(name, impl: Function) {
    const fullName = describeStack.length > 1 ? `${describeStack.slice(1).join(' > ')} > ${name}` : name;
    exp.prototype[fullName] = impl;
  };

  glob.config = function(obj) {
    const con = obj;
    for (let name of Object.getOwnPropertyNames(con)) {
      if (name != 'constructor') {
        exp.prototype[name] = con[name];
      }
    }
  };

  glob.before = function(impl: Function) {
    exp.prototype.before = impl;
  };

  glob.beforeAll = function(impl: Function) {
    exp.prototype.beforeAll = impl;
  };

  glob.beforeEach = function(impl: Function) {
    exp.prototype.beforeEach = impl;
  };

  glob.after = function(impl: Function) {
    exp.prototype.after = impl;
  };

  glob.afterAll = function(impl: Function) {
    exp.prototype.afterAll = impl;
  };

  glob.afterEach = function(impl: Function) {
    exp.prototype.afterEach = impl;
  };
}
