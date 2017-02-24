import { should } from "fuse-test-runner";

export class StringShouldPass {
    shouldCheckString1() {
        should("a").equal("a");
    }

    shouldThrowStringEqual() {
        should().throwException(() => {
            should("a").equal("b");
        });
    }

    shouldThrowStringNotEqual() {
        should().throwException(() => {
            should("a").notEqual("a");
        });
    }

    shouldMatch() {
        should("foobar").match(/foo/)
    }

    shouldNotMatch() {
        should().throwException(() => {
            should("foobar").match(/boo/)
        });
    }


    // shouldDissalowWrongObjectInLengthCheck() {
    //     should.throwException(() => {
    //         should.lengthBeEqual({}, 4);
    //     });
    // }



}