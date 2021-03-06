import { Awaiting } from './Awaiting';
import { each, utils } from 'realm-utils';
import { Exception } from './Exception';
import { Reporter } from './Reporter';
import { TestConfig } from './Config';
import { setupBridge } from './TddBridge';

setupBridge();

declare const FuseBox: any;
const systemProps = ['before', 'beforeAll', 'afterAll', 'beforeEach', 'after', 'afterEach'];

const $isSystemProp = (name: string) => {
  return systemProps.indexOf(name) > -1;
};
const $isPromise = item => {
  return item && typeof item.then === 'function' && typeof item.catch === 'function';
};

const $isFunction = (proto: any, name: string) => {
  var getType = {};
  const functionToCheck = proto[name];
  
  return (
    functionToCheck &&
    !Object.getOwnPropertyDescriptor(proto, name).get &&
    (
      getType.toString.call(functionToCheck) === '[object Function]' ||
      getType.toString.call(functionToCheck) === '[object AsyncFunction]'
    )
  );
};

export class FuseBoxTestRunner {
  public tasks: any;
  public reporter: Reporter;
  public startTime = new Date().getTime();
  private doExit = false;
  private failed = false;
  private opts;
  constructor(opts: any) {
    this.opts = opts;

    let reporterPath = opts.reporter || 'fuse-test-reporter';
    let reportLib = typeof opts.reporter === 'string' ? require(reporterPath) : opts.reporter;

    this.doExit = FuseBox.isServer && opts.exit === true;

    if (reportLib.default) {
      this.reporter = new Reporter(reportLib.default);
    } else {
      this.reporter = new Reporter(reportLib);
    }
  }
  public async finish() {
    if (this.opts.afterAll) {
      await this.opts.afterAll(TestConfig, this);
    }
    if (this.doExit) {
      process.exit(this.failed ? 1 : 0);
    }
  }

  public async start() {
    if (this.opts.beforeAll) {
      await this.opts.beforeAll(TestConfig, this);
    }
    const tests = FuseBox.import('*.test.js');
    // console.log('Test count: ' + JSON.stringify(Object.keys(tests), null ,2));
    return this.startTests(tests);
  }

  public startTests(tests: any) {
    this.reporter.initialize(tests);
    return each(tests, (moduleExports: any, name: string) => {
      if (Object.keys(moduleExports).length === 0) {
        throw new Error(`Test file '${name}' has no test exports.\nIf you are using TDD bridge, did your forget to write 'export const ClassTest = global.fuseExport;'`)
      }
      return this.startFile(name, moduleExports);
    })
      .then(res => {
        const reportResult = this.reporter.endTest(res, new Date().getTime() - this.startTime);

        if (utils.isPromise(reportResult)) {
          reportResult.then(x => this.finish()).catch(e => {
            console.error(e.stack || e);
          });
        } else {
          this.finish();
        }
      })
      .catch(e => {
        console.log(e.stack || e);
      });
  }

  protected convertToReadableName(str: string): string {
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
      if (char === '_' || char === ' ') {
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

  private extractInstructions(obj: any): any {
    let props = Object.getOwnPropertyNames(obj.constructor.prototype);
    let instructions = {
      methods: [],
      suites: {}
    };

    if (utils.isPlainObject(obj.suites)) {
      instructions.suites = obj.suites;
    }

    // collecting props and checking for setters
    for (var i = 1; i < props.length; i++) {
      let propertyName = props[i];

      if ($isFunction(obj.constructor.prototype, propertyName)) {
        if (systemProps.indexOf(propertyName) == -1) {
          instructions.methods.push(propertyName);
        } else {
          instructions[propertyName] = true;
        }
      }
    }
    return instructions;
  }

  private hasCallback(func) {
    return /^(function\s*)?([a-zA-Z0-9$_]+\s*)?\((.+)\)/.test(func.toString());
  }

  private createEvalFunction(obj: any, method: string) {
    return () => {
      return new Promise((resolve, reject) => {
        let awaiter = new Awaiting();
        awaiter.start(resolve, reject);
        const func = obj[method];
        const hasCallback = this.hasCallback(func);

        if (hasCallback) {
          func(error => {
            if (error) {
              return awaiter.resolveError(error);
            }
            return awaiter.resolveSuccess();
          });
        } else {
          let result;
          try {
            result = func.call(obj);
          } catch (e) {
            return awaiter.resolveError(e);
          }
          if ($isPromise(result)) {
            return result
              .then(() => {
                awaiter.resolveSuccess();
              })
              .catch(e => {
                awaiter.resolveError(e);
              });
          } else {
            return awaiter.resolveSuccess();
          }
        }
      });
    };
  }

  public startFile(filename: string, moduleExports: any) {
    const report = {};
    this.reporter.startFile(filename);

    return each(moduleExports, (obj: any, key: string) => {
      if (key[0] === '_') {
        return;
      }
      report[key] = {
        title: this.convertToReadableName(key),
        items: [],
        cls: obj
      };
      this.reporter.startClass(filename, report[key]);

      return this.createTasks(filename, key, obj)
        .then(items => {
          report[key].tasks = items;
        })
        .then(() => {
          this.reporter.endClass(filename, report[key]);
        });
    }).then(() => {
      return report;
    });
  }

  public createTasks(filename: string, className: string, obj: any) {
    let instance = new obj();
    let instructions = this.extractInstructions(instance);
    let tasks = [];
    if (instructions.before) {
      tasks.push({
        method: 'before',
        fn: this.createEvalFunction(instance, 'before')
      });
    }

    instructions.methods.forEach(methodName => {
      if (!$isSystemProp(methodName)) {
        if (instructions.beforeEach) {
          tasks.push({
            method: 'beforeEach',
            fn: this.createEvalFunction(instance, 'beforeEach')
          });
        }
        
        tasks.push({
          method: methodName,
          title: this.convertToReadableName(methodName),
          fn: this.createEvalFunction(instance, methodName),
          instance,
          cls: obj
        });
        
        if (instructions.afterEach) {
          tasks.push({
            method: 'afterEach',
            fn: this.createEvalFunction(instance, 'afterEach')
          });
        }
      }
    });
    if (instructions.after) {
      tasks.push({
        method: 'after',
        fn: this.createEvalFunction(instance, 'after')
      });
    }
    return this.runTasks(filename, className, tasks);
  }

  private runTasks(filename: any, className: any, tasks: any) {
    const size = tasks.length;
    let current = 0;
    return each(tasks, item => {
      return new Promise((resolve, reject) => {
        const config = TestConfig;
        config.currentTask = item;
        config.currentTask.fileName = filename;
        config.currentTask.className = className;

        return item
          .fn()
          .then(data => {
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
          })
          .catch(e => {
            let error: Exception;
            if (e instanceof Exception) {
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
