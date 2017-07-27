export declare class Awaiting {
    private timeSince;
    private timeStart;
    private resolved;
    private rejectObject;
    private successFn;
    private rejectFn;
    private timeout;
    constructor();
    start(successFn: any, rejectFn: any, timeout?: number): void;
    private poll();
    reject(obj: any): void;
    resolveSuccess(): void;
    resolveError(e?: any): void;
    resolve(obj: any): void;
}
