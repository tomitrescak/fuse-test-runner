# Introduction

TODO:

## Wallaby.js

In order to make fuse test work in wallaby.js you need to transform them to the representation that wallaby understands. For this purpose you need to use the `wallabyFuseTestLoader` in wallaby.js config. Here is an example of wallaby config for typescript files:

```js
const transform = require("fuse-test-runner").wallabyFuseTestLoader;
const path = require('path');

module.exports = function (wallaby) {
  // var load = require;

  return {
    files: [
      "src/**/*.ts*",
      "!src/**/*.test.tsx",
      "!src/**/*.test.ts",
      "!src/**/*.d.ts*"
    ],
    tests: [
      "src/**/*.test.tsx",
      "src/**/*.test.ts",
      "src/**/snapshots/*.json",
    ],
    compilers: {
      '**/*.ts?(x)': wallaby.compilers.typeScript({ jsx: 'react', module: 'commonjs' })
    },
    preprocessors: {
      "**/*.ts": file => transform(file.content),
      "**/*.tsx": file => transform(file.content) 
    },
    env: {
      type: "node"
    },
    testFramework: "mocha"
  };
};
```