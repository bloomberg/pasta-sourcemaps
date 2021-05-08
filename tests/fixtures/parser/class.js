let prop1 = "prop value 1";
let prop2 = "prop value 2 ";
let prop3 = "prop value 3";
let sym = new Symbol();
class A
{
    constructor ()
    {
        
    }
    f1()
    {
        //..
    }

    static f2() {
        //..
    }

    get z() {
        //..
    }
    set z(value) {
        //..
    }

    static get Z() {
        //..   
    }

    *f3() {
        //..
    }

    static *f4() {
        //..
    }

    async f5() {
        //..
    }

    static async f6() {
        //..
    }

    [prop1]() {
        //..
    }

    [ prop2 ]() {
        //..
    }

    static [prop3]() {
        //..
    }

    "stringLiteral" () {
        //..
    }

    " string Literal " () {
        //..
    }

    static "stringLiteral2" () {
        //..
    }

    ["abc"]() {
        //..
    }

    [ " a b c "]() {
        //..
    }

    static ["def"]() {
        //..
    }

    43() {
        //..
    }

    static 42() {
        //..
    }

    [44]() {
        //..
    }

    [ 45 ]() {
        //..
    }

    static [46]() {
        //..
    }

    ["a"+"b"]() {
        //..
    }

    static ["d"+"e"]() {
        //..
    }

    [sym]() {
        //..
    }

    [(function(){}())]() {
        //..
    }

    f7 = function() {
        //..
    };

    f8 = function localName() {
        //..
    };

    f9 = async function*() {
        //..
    };

    f10 = () => {
        //..
    };

    #f11 = function() {
        //..
    };

    #f12 = function localName() {
        //..
    };

    #f13 = async function*() {
        //..
    };

    #f14 = () => {
        //..
    };

    get #f15() {
        return 42;
        //..
    }
    set #f16(value) {
        //..
    }

    static get #f17() {
        return 42;
        //..
    }

    static set #f18(val) {
        //..
    }

    *#f19() {
        //..
    }

    static *#f20() {
        //..
    }

    async #f21() {
        //..
    }

    static async #f22() {
        //..
    }

    static #f23 = () => {
        //..
    };
}
