let prop = "property";

// variable declaration
let obj1 = {
    a1: {
        a2: {
            a3: function() {},              // obj1.a1.a2.a3
            a4: () => {},                   // obj1.a1.a2.a4
            a5() {},                        // obj1.a1.a2.a5
            a6: function localName() {}     // localName
        }
    },

    ["brown" + "fox"]: {
        42: {
            [43]: {
                "literal1": {
                    ["literal2"]: {
                        [prop]: function() {},  // obj1.<computed>.42.43.literal1.literal2.<computed: prop>
                        f1(){},                 // obj1.<computed>.42.43.literal1.literal2.f1
                    }
                }
            }
        }
    }
};

// variable assignment
let obj2;
obj2 = {
    a1: {
        a2: {
            a3: function() {},              // obj2.a1.a2.a3
            a4: () => {},                   // obj2.a1.a2.a4
            a5() {},                        // obj2.a1.a2.a5
            a6: function localName() {}     // localName
        },
    },

    ["brown" + "fox"]: {
        42: {
            [43]: {
                "literal1": {
                    ["literal2"]: {
                        [prop]: function() {},  // obj2.<computed>.42.43.literal1.literal2.<computed: prop>
                        f1(){},                 // obj2.<computed>.42.43.literal1.literal2.f1
                    }
                }
            }
        }
    }
};

// object literal not assigned to anything
function f(o) {}

f({
    a1: {
        a2: {
            a3: function() {},              // <Object>.a1.a2.a3
            a4: () => {},                   // <Object>.a1.a2.a4
            a5() {},                        // <Object>.a1.a2.a5
            a6: function localName() {}     // localName
        },
    },

    ["brown" + "fox"]: {
        42: {
            [43]: {
                "literal1": {
                    ["literal2"]: {
                        [prop]: function() {},  // <Object>.<computed>.42.43.literal1.literal2.<computed: prop>
                        f1(){},                 // <Object>.<computed>.42.43.literal1.literal2.f1
                    }
                }
            }
        }
    }
});

// destructuring
let { a, b } = {
    a: {
        c: function() {}, // <Object>.a.c
    },
    b: {
        c: function() {}, // <Object>.b.c
    },
};

// non-variable assignment
a.b.c = {
    d: {
        e: function(){},    // a.b.c.d.e
        f() {}              // a.b.c.d.f
    }
}

a[b]["literal"].c = {
    ["brown" + "fox"]: {
        42: {
            [43]: {
                "literal1": {
                    ["literal2"]: {
                        [prop]: function() {},  // a.<computed: b>.literal.c.<computed>.42.43.literal1.literal2.<computed: prop>
                        f1(){}                  // a.<computed: b>.literal.c.<computed>.42.43.literal1.literal2.f1
                    }
                }
            }
        }
    }
};
