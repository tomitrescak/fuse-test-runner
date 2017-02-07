import { utils } from "realm-utils"
export class Reporter {
    private userReporter: any;
    constructor(public target: any) {
        if (target) {
            this.userReporter = new target();
        }
    }
    private proxy(name: string, args: any) {
        let properArgs = [];
        for (let i in args) {
            if (args.hasOwnProperty(i)) {
                properArgs.push(args[i]);
            }
        }
        if (this.userReporter && utils.isFunction(this.userReporter[name])) {
            this.userReporter[name].apply(this.userReporter, properArgs);
        }
    }

    public initialize(...args) {
        this.proxy("initialize", args);
    }

    public startFile(...args) {
        this.proxy("startFile", args);
    }

    public endTest(...args): any {
        return this.proxy("endTest", args);
    }

    public endFile(...args) {
        this.proxy("endFIle", args);
    }

    public startClass(...args) {
        this.proxy("startClass", args);
    }
    public endClass(...args) {
        this.proxy("endClass", args);
    }

    public testCase(report: any) {

        this.proxy("testCase", arguments);
    }
}