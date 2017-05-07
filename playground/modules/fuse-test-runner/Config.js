"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ReactTestComponentPlugin = require("pretty-format/build/plugins/ReactTestComponent");
const ReactElementPlugin = require("pretty-format/build/plugins/ReactElement");
const prettyFormat = require("pretty-format");
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
exports.TestConfig = {
    snapshotDir: '__snapshots__',
    serializer(obj) {
        return formatComponent(obj);
    },
    currentTask: null,
    snapshotCalls: null,
    snapshotLoader: null,
    snapshotExtension: 'snap',
    onProcessSnapshots: null
};
