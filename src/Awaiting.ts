import { Exception } from './Exception';
declare const FuseBox: any;
const $nextTick = (fn: any) => {
    return setTimeout(() => {
        fn();
    }, 1);
}
export class Awaiting {
    private timeSince = 0;
    private timeStart = new Date().getTime();
    private resolved: any;
    private rejectObject: any;
    private successFn: any;
    private rejectFn: any;
    private timeout: number
    constructor() { }

    public start(successFn: any, rejectFn: any, timeout: number = 2000) {
        this.successFn = successFn;
        this.rejectFn = rejectFn;
        this.timeout = timeout;

        this.poll();
    }

    /**
     * 
     * 
     * @private
     * 
     * @memberOf Awaiting
     */
    private poll() {

        $nextTick(() => {
            this.timeSince = new Date().getTime() - this.timeStart;
            if (this.timeSince >= this.timeout) {
                this.resolveError(new Exception("Timeout error"));
            }
            if (this.rejectObject) {
                return this.rejectFn(this.rejectObject)
            }
            if (this.resolved) {
                return this.successFn(this.resolved);
            } else {
                this.poll();
            }
        });
    }

    public reject(obj: any) {
        this.rejectObject = obj || { message: "Rejected" };
    }

    public resolveSuccess() {
        this.resolved = {
            ms: this.timeSince,
            success: true
        }
    }

    public resolveError(e?: any) {
        this.resolved = {
            ms: this.timeSince,
            error: e || true
        }
    }

    public resolve(obj: any) {
        this.resolved = obj;
    }
}