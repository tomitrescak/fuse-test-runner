import { should } from "fuse-test-runner";

export class TypeChecks {


    beString() {
        should("123").beString();
    }

    beNotString() {
        should().throwException(() => should(1).beString());
    }

    beArray() {
        should([]).beArray();
    }

    beNotArray() {
        should().throwException(() => should(1).beArray());
    }

    beObject() {
        should([]).beObject();
    }

    beNotobject() {
        should().throwException(() => should(1).beObject());
    }

    bePlainObjectObject() {
        should({}).bePlainObject();
    }

    beNotPlainObject() {
        should().throwException(() => should(() => { }).bePlainObject());
    }

    bePromise() {
        should(new Promise((resolve, reject) => { })).bePromise();
    }

    beNotPromise() {
        should().throwException(() => should(() => { }).bePromise());
    }

    beFunctionArrow() {
        should(() => { }).beFunction();
    }
    beFunctionOldSchool() {
        should(function () { }).beFunction();
    }

    beNoFunction() {
        should().throwException(() => should(1).beFunction());
    }

    beNumber() {
        should(1).beNumber();
    }
    beNotNumber() {
        should().throwException(() => should("1").beNumber());
    }

    beBoolean() {
        should(true).beBoolean();
    }
    beNotBoolean() {
        should().throwException(() => should("1").beBoolean());
    }
    beUndefined() {
        should(undefined).beUndefined();
    }
    beNotUndefined() {
        should().throwException(() => should("1").beUndefined());
    }
}