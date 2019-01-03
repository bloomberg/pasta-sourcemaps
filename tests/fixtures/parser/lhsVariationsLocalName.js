let f = function local() 
{
    //..
}

a.b = function local() {
    //..
}

a.b.c = function local() {
    //..
}

a[b] = function local() {
    //..
}

a[ b ] = function local() {
    //..
}

a["b"] = function local() {
    //..
}

a[ "b" ] = function local() {
    //..
}

a[" b "] = function local() {
    //..
}

a[42] = function local() {
    //..
}

a[ 42 ] = function local() {
    //..
}

a[b.c] = function local() {
    //..
}

a[b[c]] = function local() {
    //..
}

a.b[c[d[e]]].f = function local() {
    //..
}

a["b"][42] = function local() {
    //..
}

a["b"].c[42].d[e] = function local() {
    //..
}

a["brown"+"fox"] = function local() {
    //..
}

a.b["brown"+"fox"] = function local() {
    //..
}

a["brown"+"fox"].b = function local() {
    //..
}

a["brown"+"fox"].b["white"+"rabbit"] = function local() {
    //..
}

a[(function(){return "hi";}())] = function local() {
    //..
}


let {a, b} = function local() {
    return {a: 5, b: 10};
}
