const f1 = function() 
{
    //..
}

const f2 = function localName() 
{
    //..
}

(function () {
    //..
 })();

const f3 = (function(){});

const f4 = (true ? function(){} : 4);

function f5 (x = (function() { throw Error() }())) {
    return x;
}

function f6 (x = (function local() { throw Error() }())) {
    return x;
}