export declare type Task = {
    method: string;
    title: string;
    fn: Function;
    fileName: string;
    className: string;
};
export declare type TestFunctionCall = {
    name: string;
    calls: number;
};
export declare type SnapshotItem = {
    className: string;
    content: object;
    calls: TestFunctionCall[];
};
export declare type Config = {
    snapshotDir: string;
    serializer: (obj: any) => string;
    currentTask: Task;
    snapshotCalls: SnapshotItem[];
    snapshotLoader(path: string, className: string): object;
    onProcessSnapshots(taskName: string, snapshotName: string, current: string, expected: string);
    snapshotExtension: string;
};
export declare const TestConfig: Config;
