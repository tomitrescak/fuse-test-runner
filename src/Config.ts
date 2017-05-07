import ReactTestComponentPlugin = require('pretty-format/build/plugins/ReactTestComponent');
import ReactElementPlugin = require('pretty-format/build/plugins/ReactElement');
import prettyFormat = require('pretty-format');

let PLUGINS = [ReactElementPlugin, ReactTestComponentPlugin];

const normalizeNewlines = string => string.replace(/\r\n|\r/g, '\n');
const addExtraLineBreaks = string => string.includes('\n') ? `\n${string}\n` : string;

function formatComponent(component) {
  return addExtraLineBreaks(normalizeNewlines(prettyFormat(component, {
    escapeRegex: true,
    plugins: PLUGINS,
    printFunctionName: false,
  })));
}

export type Task = {
    method: string;
    title: string;
    fn: Function;
    fileName: string;
    className: string;
}

export type TestFunctionCall = {
  name: string;
  calls: number;
}

export type SnapshotItem = {
  className: string;
  content: object;
  calls: TestFunctionCall[]
}

export type Config = {
  snapshotDir: string;
  serializer: (obj: any) => string;
  currentTask: Task;
  snapshotCalls: SnapshotItem[];
  snapshotLoader(path: string, className: string): object;
  onProcessSnapshots(taskName: string, snapshotName: string, current: string, expected: string);
  snapshotExtension: string;
}

export const TestConfig: Config = {
  snapshotDir: '__snapshots__',
  serializer(obj: any) {
    return formatComponent(obj);
  },
  currentTask: null,
  snapshotCalls: null,
  snapshotLoader: null,
  snapshotExtension: 'snap',
  onProcessSnapshots: null
}