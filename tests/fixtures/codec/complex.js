function f1 () 
{
    //..
    (function () {
        [1,2,3].map(x=>x*x);
     })();
    //..
}

let x = function () {
    let y = function() {
        let z = function () {
            return 42;
        }
        return z();
    }
    return y();
}
x();

//..