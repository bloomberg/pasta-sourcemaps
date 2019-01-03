let f = function() 
{
    //..
}

a.b = function () {
    //..
}

a.b.c = function() {
    //..
}

a[b] = function() {
    //..
}

a[ b ] = function() {
    //..
}

a["b"] = function() {
    //..
}

a[ "b" ] = function() {
    //..
}

a[" b "] = function() {
    //..
}

a[42] = function() {
    //..
}

a[ 42 ] = function() {
    //..
}

a[b.c] = function() {
    //..
}

a[b[c]] = function() {
    //..
}

a.b[c[d[e]]].f = function() {
    //..
}

a["b"][42] = function() {
    //..
}

a["b"].c[42].d[e] = function() {
    //..
}

a["brown"+"fox"] = function() {
    //..
}

a.b["brown"+"fox"] = function() {
    //..
}

a["brown"+"fox"].b = function() {
    //..
}

a["brown"+"fox"].b["white"+"rabbit"] = function () {
    //..
}

a[(function(){return "hi";}())] = function () {
    //..
}

let {a, b} = function() {
    //..
}

let name;
({ name } = function(){});
