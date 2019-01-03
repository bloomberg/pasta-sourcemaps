function f1() 
{
    //..
}

const f2 = function() 
{
    //..
}

const f3 = (x) => {
    //..
}

const f4 = function() {
    //..
    const f5 = () => {
        //..
        (function() {
            //..
        })();
    }
    f5();
}

class Foo {
    constructor(){
        //..
    }
    method1() {
        //..
    }
    get prop() {
        //..
    }
    set prop(value){
        //..
    }
}

