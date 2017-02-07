import { should } from "fuse-test";

export class StringShouldPass {
    shouldCheckString1() {
        should.equal("a", "a")
    }

    shouldThrowStringEqual() {
        should.throwException(() => {
            should.equal("a", "b");
        });
    }

    shouldThrowStringNotEqual() {
        should.throwException(() => {
            should.notEqual("a", "a");
        });
    }

    shouldLengthBeOkay() {
        should.lengthBeEqual("123", 3);
    }

    shouldLengthBeNotOkay() {
        should.throwException(() => {
            should.lengthBeEqual("123", 4);
        });
    }

    shouldDissalowWrongObjectInLengthCheck() {
        should.throwException(() => {
            should.lengthBeEqual({}, 4);
        });
    }



}