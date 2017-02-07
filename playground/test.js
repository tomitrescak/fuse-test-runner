const fb = require("fuse-box");
const Fusebox = fb.FuseBox;

const fuse = Fusebox.init({
    // faking it here
    // so we can require fuse-test
    modulesFolder: "playground/modules",
    cache: false,
    homeDir: "playground/src",
    outFile: "build/out.js"
});
fuse.test();