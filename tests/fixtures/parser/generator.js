function* f1()
{ 
    //..
}
const genObj1 = f1();

const f2 = function* ()
{
    //..
}
const getObj2 = f2();

const obj = {
    * f3() {
        //..
    }
};
const genOb3j = obj.f3();

class MyClass {
    * f4() {
        //..
    }
}
const myInst = new MyClass();
const genObj = myInst.f4();