import { Exception, SnapshotException } from './Exception';
import { utils } from 'realm-utils';
import { TestConfig } from './Config';
import * as fs from 'fs';
import * as path from 'path';
import * as jsdiff from 'diff';

export class ShouldInstance {
  constructor(private obj?: any) {}

  public mutate(fn: any) {
    this.obj = fn(this.obj);
    return this;
  }

  public equal(expected: any) {
    if (this.obj !== expected) {
      throw new Exception(`Expected ${this.obj} to equal ${expected}`);
    }
    return this;
  }

  public notEqual(expected: string) {
    if (this.obj === expected) {
      throw new Exception(`Expected ${this.obj} to not equal ${expected}`);
    }
    return this;
  }

  public notMatch(exp: RegExp) {
    this.beString();
    if (exp.test(this.obj)) {
      throw new Exception(`Expected ${this.obj} to match ${exp}`);
    }
    return this;
  }

  public stripComments(text: string) {
      text = text.replace(/<!-- react-empty: \d+ -->\n?/g, '');
    text = text.replace(/<!-- react-text: \d+ -->\n?/g, '');
    text = text.replace(/<!-- \/react-text -->\n?/g, '');
    return text;
  }

  public matchSnapshot(createDiff = false) {
    const config = TestConfig;
    const snapshotDir = path.resolve(config.snapshotDir);

    if (!config.snapshotCalls) {
      config.snapshotCalls = [];
    }
    const { currentTask, snapshotCalls } = config;

    var fileName = path.join(snapshotDir, `${currentTask.className}_snapshots.${config.snapshotExtension}`);
    var snapshotCall = snapshotCalls.find(w => w.className === currentTask.className);

    // we either overwrite existing file or append to it
    if (snapshotCall == null) {
      snapshotCall = { className: currentTask.className, content: process.env.UPDATE_SNAPSHOTS ? {} : null, calls: [] };
      snapshotCalls.push(snapshotCall);
    }

    // find function
    var call = snapshotCall.calls.find(w => w.name == currentTask.title);
    if (call == null) {
      call = { name: currentTask.title, calls: 1 };
      snapshotCall.calls.push(call);
    }

    // we can update all snapshots or match against current one
    if (process.env.UPDATE_SNAPSHOTS) {
      // make sure snapshot dir exists
      // TODO: save files to the location where tests are
      // The problem here is that I do not know how to access the root of FuseBox project
      try {
        fs.statSync(snapshotDir);
      } catch (ex) {
        fs.mkdirSync(snapshotDir);
      }

      // add current task
      snapshotCall.content[currentTask.title + ' ' + call.calls] = this.stripComments(config.serializer(this.obj));
      if (!process.env.SNAPSHOT || currentTask.title.match(process.env.SNAPSHOT)) {
        fs.writeFileSync(fileName, JSON.stringify(snapshotCall.content, null, 2));
      }
      call.calls++;
    } else {
      let currentValue = this.stripComments(config.serializer(this.obj));

      // check if we have loaded the file
      if (!snapshotCall.content) {
        if (config.snapshotLoader != null) {
          snapshotCall.content = config.snapshotLoader(fileName, currentTask.className);
        } else {
          try {
            fs.statSync(fileName);
            snapshotCall.content = JSON.parse(fs.readFileSync(fileName) as any) as any;
          } catch (ex) {}
        }
        if (!snapshotCall.content) {
          throw new Exception(`Snapshot file for ${currentTask.className} does not exist at '${fileName}'!`);
        }
      }

      const name = currentTask.title + ' ' + call.calls++;
      let snapshot = snapshotCall.content[name];

      if (config.onProcessSnapshots) {
        config.onProcessSnapshots(currentTask.title, name, currentValue, snapshot);
      }

      if (!snapshot) {
        throw new SnapshotException(`Snapshot does not exist!`, null, currentValue, name);
      }

      if (snapshot !== currentValue) {
        if (createDiff) {
          // use jsdiff to compare
        //   let message = '';
        //   var diff = jsdiff.diffChars(snapshot, currentValue);
        //   diff.forEach(function(part) {
        //     if (
        //       typeof window === 'undefined' ||
        //       window.location == null ||
        //       window.location.href == null ||
        //       window.location.href == 'about:blank'
        //     ) {
        //       if (part.added) {
        //         message += '\x1b[32m' + part.value;
        //       } else if (part.removed) {
        //         message += '\x1b[31m' + part.value;
        //       } else if (message) {
        //         message += '\x1b[37m' + part.value.substring(0, 30) + '\n';
        //       } else {
        //         message += '\x1b[37m' + part.value.substring(part.value.length - 30);
        //       }
        //     } else {
        //       if (part.added) {
        //         message += '<span class="diffadded">' + part.value + '</span>';
        //       } else if (part.removed) {
        //         message += '<span class="diffremoved">' + part.value + '</span>';
        //       } else if (message) {
        //         message += part.value.substring(0, 30) + '<br />';
        //       } else {
        //         message += part.value.substring(part.value.length - 30);
        //       }
        //     }
        //   });
        var message = `${currentValue}\n\n\n===================\n\n\n${snapshot}`
          throw new SnapshotException(`Snapshots do not match: \n${message}`, snapshot, currentValue, name);
        }
        throw new SnapshotException(`Snapshots do not match`, snapshot, currentValue, name);
      }
    }
    return this;
  }

  public match(exp: RegExp) {
    this.beString();
    if (!exp.test(this.obj)) {
      throw new Exception(`Expected ${this.obj} to match ${exp}`);
    }
    return this;
  }

  public findString(target: string) {
    this.beString();
    if (this.obj.indexOf(target) === -1) {
      throw new Exception(`Expected ${this.obj} to have ${target}`);
    }
    return this;
  }

  public notFindString(target: string) {
    this.beString();
    if (this.obj.indexOf(target) > -1) {
      throw new Exception(`Expected ${this.obj} not to have ${target}`);
    }
    return this;
  }

  public okay() {
    if (this.obj === undefined || this.obj === null) {
      throw new Exception(`Expected ${this.obj} to be not undefined or null`);
    }
    return this;
  }

  public haveLength(expected?: number) {
    this.okay();
    if (this.obj.length === undefined) {
      throw new Exception(`Expected ${this.obj} to have length, got undefined`);
    }
    if (expected !== undefined) {
      if (this.obj.length !== expected) {
        throw new Exception(`Expected ${this.obj} to have length of ${expected}. Got ${this.obj.length}`);
      }
    }
    return this;
  }

  /**
     * ************************************************************
     * HAVE LENGTH 
     * ************************************************************
     */
  public haveLengthGreater(expected: number) {
    this.haveLength();

    if (this.obj.length < expected) {
      throw new Exception(`Expected ${this.obj} length be greater than ${expected}. Got ${this.obj.length}`);
    }
    return this;
  }
  public haveLengthGreaterEqual(expected: number) {
    this.haveLength();
    if (!(this.obj.length >= expected)) {
      throw new Exception(`Expected ${this.obj} length be greater or equal than ${expected}. Got ${this.obj.length}`);
    }
    return this;
  }

  public haveLengthLess(expected: number) {
    this.haveLength();
    if (!(this.obj.length < expected)) {
      throw new Exception(`Expected ${this.obj} length be less than ${expected}. Got ${this.obj.length}`);
    }
    return this;
  }

  public haveLengthLessEqual(expected: number) {
    this.haveLength();
    if (!(this.obj.length <= expected)) {
      throw new Exception(`Expected ${this.obj} length be less or equal than ${expected}. Got ${this.obj.length}`);
    }
    return this;
  }

  public throwException(fn: any) {
    try {
      fn();

      throw { __exception_test__: true };
    } catch (e) {
      if (e && e.__exception_test__) {
        throw new Exception(`Expected exception did not occur`);
      }
    }
  }

  public deepEqual(expected: any) {
    function $deepEqual(a, b) {
      if (typeof a == 'object' && a != null && (typeof b == 'object' && b != null)) {
        var count = [0, 0];
        for (var key in a) count[0]++;
        for (var key in b) count[1]++;
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
      } else {
        return a === b;
      }
    }
    const result = $deepEqual(this.obj, expected);
    if (result === false) {
      throw new Exception(`Expected the original
${JSON.stringify(this.obj, null, 2)} 
to be deep equal to 
${JSON.stringify(expected, null, 2)}`);
    }
    return this;
  }

  public beTrue() {
    if (this.obj !== true) {
      throw new Exception(`Expected ${this.obj} to be true, got ${this.obj}`);
    }
    return this;
  }

  public beFalse() {
    if (this.obj !== false) {
      throw new Exception(`Expected ${this.obj} to be false, got ${this.obj}`);
    }
    return this;
  }

  /**
     * BeChecks
     * **************************************************************************************
     */
  public beString() {
    if (!utils.isString(this.obj)) {
      throw new Exception(`Expected ${this.obj} to be a string, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beArray() {
    if (!utils.isArray(this.obj)) {
      throw new Exception(`Expected ${this.obj} to be an array, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beObject() {
    if (!utils.isObject(this.obj)) {
      throw new Exception(`Expected ${this.obj} to be an obj, Got ${typeof this.obj}`);
    }
    return this;
  }

  public bePlainObject() {
    if (!utils.isPlainObject(this.obj)) {
      throw new Exception(`Expected ${this.obj} to be a plain object, Got ${typeof this.obj}`);
    }
    return this;
  }

  public bePromise() {
    if (!utils.isPromise(this.obj)) {
      throw new Exception(`Expected ${this.obj} to be a promise, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beFunction() {
    if (!utils.isFunction(this.obj)) {
      throw new Exception(`Expected ${this.obj} to be a function, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beNumber() {
    if (typeof this.obj !== 'number') {
      throw new Exception(`Expected ${this.obj} to be a number, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beBoolean() {
    if (typeof this.obj !== 'boolean') {
      throw new Exception(`Expected ${this.obj} to be a boolean, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beUndefined() {
    if (this.obj !== undefined) {
      throw new Exception(`Expected ${this.obj} to be a undefined, Got ${typeof this.obj}`);
    }
    return this;
  }

  public beMap() {
    if (this.obj instanceof Map === false) {
      throw new Exception(`Expected ${this.obj} to be instanceof Map ${typeof this.obj}`);
    }
    return this;
  }

  public beSet() {
    if (this.obj instanceof Set === false) {
      throw new Exception(`Expected ${this.obj} to be instanceof Map ${typeof this.obj}`);
    }
    return this;
  }

  public beInstanceOf(obj: any) {
    if (this.obj instanceof obj === false) {
      throw new Exception(`Expected ${this.obj} to be instanceof ${obj}`);
    }
    return this;
  }

  public beOkay() {
    if (this.obj === undefined || this.obj === null || this.obj === NaN) {
      throw new Exception(`Expected ${this.obj} to be a not undefined | null | NaN, Got ${typeof this.obj}`);
    }
    return this;
  }
}

export const should = (obj?: any) => {
  return new ShouldInstance(obj);
};
