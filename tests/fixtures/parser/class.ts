let prop1 = "prop1";
let prop2 = "prop2";
let prop3 = "prop3";
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

    private static f5 = function() {
        //..
    };

    public static f6 = function localName() {
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

    public *f7() {
        //..
    }

    static *f8() {
        //..
    }

    private async f9() {
        //..
    }

    static async f10() {
        //..
    }

    protected f11 = () => {
        //..
    };

    static f12 = () => {
        //..
    };

    [prop1]() {
        //..
    }

    static [prop2]() {
        //..
    }

    "stringLiteral1" () {
        //..
    }

    "stringLiteral2" = function()
    {
        //..
    };

    static "stringLiteral3" () {
        //..
    }

    static "stringLiteral4" = function() {
        //..
    };

    ["abc"]() {
        //..
    }

    static ["def"]() {
        //..
    }

    static ["xyz"] = function() {
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

    static 45() {
        //..
    }

    static [46]() {
        //..
    }

    static 47 = function() {
        //..
    };

    static [48] = function() {
        //..
    };

    ["a"+"b"]() {
        //..
    }

    static ["c"+"d"]() {
        //..
    }

    [sym1]() {
        //..
    }

    f13 = function() {
        //..
    };

    f14 = function localName() {
        //..
    };

    f15 = async function*() {
        //..
    };

    f16 = () => {
        //..
    };

    #f17 = function() {
        //..
    };

    #f18 = function localName() {
        //..
    };

    #f19 = async function*() {
        //..
    };

    #f20 = () => {
        //..
    };

    get #f21() {
        return 42;
        //..
    }
    set #f22(value) {
        //..
    }

    static get #f23() {
        return 42;
        //..
    }

    static set #f24(val: unknown) {
        //..
    }

    *#f25() {
        //..
    }

    static *#f26() {
        //..
    }

    async #f27() {
        //..
    }

    static async #f28() {
        //..
    }

    static #f29 = () => {
        //..
    };
}
