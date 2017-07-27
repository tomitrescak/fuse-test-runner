import { Reporter } from './Reporter';
export declare class FuseBoxTestRunner {
    tasks: any;
    reporter: Reporter;
    startTime: number;
    private doExit;
    private failed;
    private opts;
    constructor(opts: any);
    finish(): Promise<void>;
    start(): Promise<void>;
    startTests(tests: any): Promise<void>;
    protected convertToReadableName(str: string): string;
    private extractInstructions(obj);
    private hasCallback(func);
    private createEvalFunction(obj, method);
    startFile(filename: string, moduleExports: any): Promise<{}>;
    createTasks(filename: string, className: string, obj: any): Promise<any>;
    private runTasks(filename, className, tasks);
}
