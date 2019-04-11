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
}