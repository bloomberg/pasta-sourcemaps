function t1(x:number, y?:number, z=0): number
{
    //..
    return 42;
}

function t2(x:string, ...rest: string[])
{
    //..
    return 42;
}

let t3: (x:number) => number = function(x:number): number 
{
    //..
    return 42;
}

let t4 = function(x:number)
{
    //..
    return 42;
}

let o = {
    t5: function(x:number)
    {
        //..
        return 42;
    }, 
    t6: (x:number) => {
        //..
        return 42;
    },
    t7(){
        return 42;
    }
}

function t8<T, K extends keyof T>(obj: T, key: K) {
    return obj[key];
}

const sym = Symbol();
class C 
{
    constructor(private y: number){}

    private t9(x:number):void
    {
        //..
    }
    public static t10 = (x:number) => {return x*x};

    public t11() : this
    {
        return this;
    }

    public [sym]() {
       return 42;
    }

    protected ["a"+"b"]() {
        return 42;
    }

    private _z:number;
    get z(): number
    {
        return this._z;
    }
    set z(newZ: number)
    {
        this.z = newZ;
    }
}

