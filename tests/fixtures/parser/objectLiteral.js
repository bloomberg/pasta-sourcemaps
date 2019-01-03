const prop1 = "some string";
const prop2 = "some string";
const obj = {
    f1() {
        //..
    }, 
    f2: function() {
        //..
    },
    f3: function localName () {
        //..
    },
    f4: (x,y) => {
        //..
    },
    *f5 () {
        //..
    },
    async f6() {
        //..
    },
    "literal" () {
        //..
    },
    "literal2": function() {
        //..
    },
    " literal 3 " () {
        //..
    },
    " literail 4 ": function() {
        //..
    },
    42 () {
        //..
    },
    43: function() {
        //..
    },
    [44]() {
        //..
    },
    [ 45 ]() {
        //..
    },
    [prop1]() {
        //..
    },
    [ prop2 ]() {
        //..
    },
    ["abc"]() {
        //..
    },
    [ "abc d" ]() {
        //..
    },
    [" a b c "]() {
        //..
    },
    ["abc"+"def"]() {
        //..
    }
};