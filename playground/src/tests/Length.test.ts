import { should } from "fuse-test";

export class StringShouldPass {


    shouldLengthBeOkayForStrings() {
        should("123").length(3);
    }

    shouldLengthBeOkayForArrays() {
        should([1, 2, 3]).length(3);
    }

    shouldLengthBeNotOkayForStrings() {
        should().throwException(() => {
            should("123").length(4)
        });
    }

    shouldLengthBeNotOkayForArrays() {
        should().throwException(() => {
            should([1, 2, 3]).length(4)
        });
    }



    shouldLengthGreater() {
        should("123").lengthGreater(2);
    }

    shouldLengthGreaterEqual() {
        should("123").lengthGreaterEqual(3);
    }

    shouldLengthGreaterEqualError() {
        should().throwException(() => {
            should("123").lengthGreaterEqual(5);
        })
    }

    shouldLengthLess() {
        should("123").lengthLess(4);
    }

    shouldLengthLessEqual() {
        should("123").lengthLessEqual(3);
    }


    shouldLengthLessEqualError() {
        should().throwException(() => {
            should("123").lengthLessEqual(1);
        })
    }



}