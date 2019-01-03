class Bar {
    constructor(){
        //..
    }

    get prop() {
        //..
    }
    set prop(value){
        //..
    }
}

const f1 = function() {
    //..
}

const bar1 = (x, y) => {
    //..
}

function *bar2() {
    //..
}

function bar3 (x = (function() { throw Error() }())) {
    return x;
}