/*
 ** Copyright 2019 Bloomberg Finance L.P.
 **
 ** Licensed under the Apache License, Version 2.0 (the "License");
 ** you may not use this file except in compliance with the License.
 ** You may obtain a copy of the License at
 **
 **     http://www.apache.org/licenses/LICENSE-2.0
 **
 ** Unless required by applicable law or agreed to in writing, software
 ** distributed under the License is distributed on an "AS IS" BASIS,
 ** WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 ** See the License for the specific language governing permissions and
 ** limitations under the License.
 */

import { compareFunction, FunctionDesc } from "../src/functionDesc.js";
import { strict as assert } from "assert";

it("unit test: compareFunction", () => {
    const a = new FunctionDesc("f1", 10, 4, 20, 10);

    // equal
    let b = new FunctionDesc("f2", 10, 4, 20, 10);
    assert.equal(compareFunction(a, b), 0);

    // a < b
    b = new FunctionDesc("f2", 22, 0, 42, 0);
    assert.equal(compareFunction(a, b), -1);

    // a < b, starting line number same
    b = new FunctionDesc("f2", 10, 8, 20, 8);
    assert.equal(compareFunction(a, b), -1);

    // a > b
    b = new FunctionDesc("f3", 8, 0, 9, 0);
    assert.equal(compareFunction(a, b), 1);

    // a > b, starting line number same
    b = new FunctionDesc("f4", 10, 0, 10, 3);
    assert.equal(compareFunction(a, b), 1);
});
