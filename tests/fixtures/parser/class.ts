let prop1 = "prop1";
let sym1 = Symbol();
class D
{
    constructor ()
    {
        //..
    }
    public f1()
    {
        //..
    }

    private f2 = function() 
    {
        //..
    };

    protected f3 = function localName() {

        //..
    };

    static f4() {
        //..
    }

    get z() {
        return 42;
        //..
    }
    set z(value) {
        //..
    }

    static get Z() {
        return 42;
        //..   
    }

    public *f5() {
        //..
    }

    static *f6() {
        //..
    }

    private async f7() {
        //..
    }

    static async f8() {
        //..
    }

    protected f9 = () => {
        //..
    };

    [prop1]() {
        //..
    }

    "stringLiteral1" () {
        //..
    }

    "stringLiteral2" = function() 
    {
        //..
    };

    ["abc"]() {
        //..
    }

    42 = function () 
    {
        //..
    };

    43() {
        //..
    }

    [44]() {
        //..
    }

    ["a"+"b"]() {
        //..
    }

    [sym1]() {
        //..
    }


}