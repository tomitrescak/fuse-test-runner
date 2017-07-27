export declare class Exception extends Error {
    message: string;
    filename: string;
    methodName: string;
    title: string;
    className: string;
    constructor(message: string);
}
export declare class SnapshotException extends Exception {
    message: string;
    expected: string;
    current: string;
    name: string;
    constructor(message: string, expected: string, current: string, name: string);
}
