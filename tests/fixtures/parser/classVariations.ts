class A {
    constructor() {}            // A
    f() {}                      // A.prototype.f
    #f() {}                     // A.prototype.#f
    static g(){}                // A.g
    static #g(){}               // A.#g
    h = function(){}            // h
    #h = function(){}           // #h
    static i = function(){}     // A.i
    static #i = function(){}    // A.#i
    get j() {return 1;}         // A.prototype.get j
    get #j() {return 1;}        // A.prototype.get #j
    set j(p){}                  // A.prototype.set j
    set #j(p){}                 // A.prototype.set #j
    static get K(){return 1;}   // A.get K
    static get #K(){return 1;}  // A.get #K
    static set K(p){}           // A.set K
    static set #K(p){}          // A.set #K
}

const B = class {
    constructor(){}             // B
    f(){}                       // B.prototype.f
    #f(){}                      // B.prototype.#f
    static g(){}                // B.g
    static #g(){}               // B.#g
    h = function(){}            // h
    #h = function(){}           // #h
    static i = function(){}     // B.i
    static #i = function(){}    // B.#i
    get j() {return 1;}         // B.prototype.get j
    get #j() {return 1;}        // B.prototype.get #j
    set j(p){}                  // B.prototype.set j
    set #j(p){}                 // B.prototype.set #j
    static get K(){return 1;}   // B.get K
    static get #K(){return 1;}  // B.get #K
    static set K(p){}           // B.set K
    static set #K(p){}          // B.set #K
}

const C = class LocalName {
    constructor(){}             // LocalName
    f(){}                       // LocalName.prototype.f
    #f(){}                      // LocalName.prototype.#f
    static g(){}                // LocalName.g
    static #g(){}               // LocalName.#g
    h = function(){}            // h
    #h = function(){}           // #h
    static i = function(){}     // LocalName.i
    static #i = function(){}    // LocalName.#i
    get j() {return 1;}         // LocalName.prototype.get j
    get #j() {return 1;}        // LocalName.prototype.get #j
    set j(p){}                  // LocalName.prototype.set j
    set #j(p){}                 // LocalName.prototype.set #j
    static get K(){return 1;}   // LocalName.get K
    static get #K(){return 1;}  // LocalName.get #K
    static set K(p){}           // LocalName.set K
    static set #K(p){}          // LocalName.set #K
}

let a = { 
    B: class {
        constructor(){}             // a.B
        f(){}                       // a.B.prototype.f
        #f(){}                      // a.B.prototype.#f
        static g(){}                // a.B.g
        static #g(){}               // a.B.#g
        h = function(){}            // h
        #h = function(){}           // #h
        static i = function(){}     // a.B.i
        static #i = function(){}    // a.B.#i
        get j() {return 1;}         // a.B.prototype.get j
        get #j() {return 1;}        // a.B.prototype.get #j
        set j(p){}                  // a.B.prototype.set j
        set #j(p){}                 // a.B.prototype.set #j
        static get K(){return 1;}   // a.B.get K
        static get #K(){return 1;}  // a.B.get #K
        static set K(p){}           // a.B.set K
        static set #K(p){}          // a.B.set #K
    }
}

let x = { 
    y: class LocalName {
        constructor(){}             // LocalName
        f(){}                       // LocalName.prototype.f
        #f(){}                      // LocalName.prototype.#f
        static g(){}                // LocalName.g
        static #g(){}               // LocalName.#g
        h = function(){}            // h
        #h = function(){}           // #h
        static i = function(){}     // LocalName.i
        static #i = function(){}    // LocalName.#i
        get j() {return 1;}         // LocalName.prototype.get j
        get #j() {return 1;}        // LocalName.prototype.get #j
        set j(p){}                  // LocalName.prototype.set j
        set #j(p){}                 // LocalName.prototype.set #j
        static get K(){return 1;}   // LocalName.get K
        static get #K(){return 1;}  // LocalName.get #K
        static set K(p){}           // LocalName.set K
        static set #K(p){}          // LocalName.set #K
    }
}

a.B = class {
    constructor(){}             // a.B
    f(){}                       // a.B.prototype.f
    #f(){}                      // a.B.prototype.#f
    static g(){}                // a.B.g
    static #g(){}               // a.B.#g
    h = function(){}            // h
    #h = function(){}           // #h
    static i = function(){}     // a.B.i
    static #i = function(){}    // a.B.#i
    get j() {return 1;}         // a.B.prototype.get j
    get #j() {return 1;}        // a.B.prototype.get #j
    set j(p){}                  // a.B.prototype.set j
    set #j(p){}                 // a.B.prototype.set #j
    static get K(){return 1;}   // a.B.get K
    static get #K(){return 1;}  // a.B.get #K
    static set K(p){}           // a.B.set K
    static set #K(p){}          // a.B.set #K
}

x.y = class LocalName {
    constructor(){}             // LocalName
    f(){}                       // LocalName.prototype.f
    #f(){}                      // LocalName.prototype.#f
    static g(){}                // LocalName.g
    static #g(){}               // LocalName.#g
    h = function(){}            // h
    #h = function(){}           // #h
    static i = function(){}     // LocalName.i
    static #i = function(){}    // LocalName.#i
    get j() {return 1;}         // LocalName.prototype.get j
    get #j() {return 1;}        // LocalName.prototype.get #j
    set j(p){}                  // LocalName.prototype.set j
    set #j(p){}                 // LocalName.prototype.set #j
    static get K(){return 1;}   // LocalName.get K
    static get #K(){return 1;}  // LocalName.get #K
    static set K(p){}           // LocalName.set K
    static set #K(p){}          // LocalName.set #K
}

let m = {
    n: {
        O: class {
            constructor(){}                 // m.n.O
            p = function(){}                // p
            #p = function(){}               // #p
            q = function localName(){ }     // localName
            #q = function localName(){ }    // localName
            r(){}                           // m.n.O.prototype.r
            #r(){}                          // m.n.O.prototype.#r
            static s(){}                    // m.n.O.s
            static #s(){}                   // m.n.O.#s
            static t = function(){}         // m.n.O.t
            static #t = function(){}        // m.n.O.#t
            get a(){return 5;}              // m.n.O.prototype.get a
            get #a(){return 5;}             // m.n.O.prototype.get #a
    },
        W: class LocalName {
            constructor(){}                 // LocalName
            p = function(){}                // p
            #p = function(){}               // #p
            q = function localName(){ }     // localName
            #q = function localName(){ }    // localName
            r(){}                           // LocalName.prototype.r
            #r(){}                          // LocalName.prototype.#r
            static s(){}                    // LocalName.s
            static #s(){}                   // LocalName.#s
            static t = function(){}         // LocalName.t
            static #t = function(){}        // LocalName.#t
            get a(){return 5;}              // LocalName.prototype.get a
            get #a(){return 5;}             // LocalName.prototype.get #a
        }, 
        ["Q"]: class {
            r(){}                           // m.n.Q.prototype.r
        }, 
        ["Q" + "Z"]: class {
            r(){}                           // m.n.<computed>.prototype.r
        }
    }
}


