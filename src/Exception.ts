export class Exception extends Error {
    public filename: string;
    public methodName: string;
    public title: string;
    public className: string;
    constructor(public message: string) {
        super(message);
    }
}