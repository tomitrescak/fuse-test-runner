export declare class Reporter {
    target: any;
    private userReporter;
    constructor(target: any);
    private proxy(name, args);
    initialize(...args: any[]): void;
    startFile(...args: any[]): void;
    endTest(...args: any[]): any;
    endFile(...args: any[]): void;
    startClass(...args: any[]): void;
    endClass(...args: any[]): void;
    testCase(report: any): void;
}
