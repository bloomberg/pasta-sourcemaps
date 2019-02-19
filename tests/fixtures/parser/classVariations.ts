class A {
    constructor() {}        // A
    f() {}                  // A.prototype.f
    static g(){}            // A.g
    h = function(){}        // h
    static i = function(){} // A.i
}

const B = class {
    constructor(){}         // B
    f(){}                   // B.prototype.f
    static g(){}            // B.g
    h = function(){}        // h
    static i = function(){} // B.i
}

const C = class LocalName {
    constructor(){}         // LocalName
    f(){}                   // LocalName.prototype.f
    static g(){}            // LocalName.g
    h = function(){}        // h
    static i = function(){} // LocalName.i
}

let a = { 
    B: class {
        constructor(){}             // a.B
        f(){}                       // a.B.prototype.f
        static g(){}                // a.B.g
        h = function(){}            // h
        static i = function(){}     // a.B.i
    }
}

let x = { 
    y: class LocalName {
        constructor(){}         // LocalName
        f(){}                   // LocalName.prototype.f
        static g(){}            // LocalName.g
        h = function(){}        // h
        static i = function(){} // LocalName.i
    }
}

a.B = class {
    constructor(){}         // a.B
    f(){}                   // a.B.prototype.f
    static g(){}            // a.B.g
    h = function(){}        // h
    static i = function(){} // a.B.i
}

x.y = class LocalName {
    constructor(){}         // LocalName
    f(){}                   // LocalName.prototype.f
    static g(){}            // LocalName.g
    h = function(){}        // h
    static i = function(){} // LocalName.i
}

let m = {
    n: {
        O: class {
            constructor(){}                 // m.n.O
            p = function(){}                // p
            q = function localName(){ }     // localName
            r(){}                           // m.n.O.prototype.r
            static s(){}                    // m.n.O.s
            static t = function(){}         // m.n.O.t
            get a(){return 5;}              // m.n.O.prototype.get a
        }, 
        W: class LocalName {
            constructor(){}                 // LocalName
            p = function(){}                // p
            q = function localName(){ }     // localName
            r(){}                           // LocalName.prototype.r
            static s(){}                    // LocalName.s
            static t = function(){}         // LocalName.t
            get a(){return 5;}              // LocalName.prototype.get a
        }, 
        ["Q"]: class {
            r(){}                           // m.n.Q.prototype.r
        }, 
        ["Q" + "Z"]: class {
            r(){}                           // m.n.<computed>.prototype.r
        }
    }
}


