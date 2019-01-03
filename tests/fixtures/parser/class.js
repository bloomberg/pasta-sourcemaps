let prop1 = "prop value";
let prop2 = "prop value";
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

    "stringLiteral" () {
        //..
    }

    " string Literal " () {
        //..
    }

    43() {
        //..
    }

    ["abc"]() {
        //..
    }

    [ " a b c "]() {
        //..
    }

    [44]() {
        //..
    }

    [ 45 ]() {
        //..
    }

    ["a"+"b"]() {
        //..
    }

    [sym]() {
        //..
    }

    [(function(){}())]() {
        //..
    }
}