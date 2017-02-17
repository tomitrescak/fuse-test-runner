import { should } from "fuse-test";

export class StringShouldPass {


    shouldLengthBeOkayForStrings() {
        should("123").haveLength(3);
    }

    shouldLengthBeOkayForArrays() {
        should([1, 2, 3]).haveLength(3);
    }

    shouldLengthBeNotOkayForStrings() {
        should().throwException(() => {
            should("123").haveLength(4)
        });
    }

    shouldLengthBeNotOkayForArrays() {
        should().throwException(() => {
            should([1, 2, 3]).haveLength(4)
        });
    }



    shouldLengthGreater() {
        should("123").haveLengthGreater(2);
    }

    shouldLengthGreaterEqual() {
        should("123").haveLengthGreaterEqual(3);
    }

    shouldLengthGreaterEqualError() {
        should().throwException(() => {
            should("123").haveLengthGreaterEqual(5);
        })
    }

    shouldLengthLess() {
        should("123").haveLengthLess(4);
    }

    shouldLengthLessEqual() {
        should("123").haveLengthLessEqual(3);
    }


    shouldLengthLessEqualError() {
        should().throwException(() => {
            should("123").haveLengthLessEqual(1);
        })
    }



}