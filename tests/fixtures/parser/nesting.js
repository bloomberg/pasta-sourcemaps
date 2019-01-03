function f1()
{
    function f2()
    {
        [1,2,3].map(x=>x*x);
        function f3 ()
        {
            //..
        }
    }
    f2();

    (function () {
        //..
     })();

     [1,2,3].map(x=>x*x);
}