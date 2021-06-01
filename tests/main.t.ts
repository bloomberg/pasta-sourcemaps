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

import { encode, FunctionDesc, parse, SourceMapDecoder } from "../src/main.js";
import {
    JSONFromFile as JSONFromFileInFolder,
    readFile as readFileInFolder,
} from "./helper.t.js";

import { strict as assert } from "assert";

function JSONFromFile(file: string) {
    return JSONFromFileInFolder(file, "integration");
}

function readFile(file: string) {
    return readFileInFolder(file, "integration");
}

it("integration test", () => {
    const sourceFoo = readFile("foo.js");
    const sourceBar = readFile("bar.js");

    // starting sourcemap
    const sourceMap = JSONFromFile("integration.sourceMap.json");

    // parse the source
    const functionDescs = new Map<string, FunctionDesc[]>([
        ["foo.js", parse(sourceFoo, "ECMAScript")],
        ["bar.js", parse(sourceBar, "ECMAScript")],
    ]);

    // encode the function mappings into an enriched sourcemap
    const enrichedSourceMap = encode(sourceMap, functionDescs);
    const decoder = new SourceMapDecoder(enrichedSourceMap);

    assert.equal(decoder.decode("foo.js", 2, 5), "f1");
    assert.equal(decoder.decode("foo.js", 7, 5), "f2");
    assert.equal(decoder.decode("foo.js", 11, 5), "f3");
    assert.equal(decoder.decode("foo.js", 15, 5), "f4");
    assert.equal(decoder.decode("foo.js", 17, 5), "f5");
    assert.equal(decoder.decode("foo.js", 19, 5), "<anonymous>");
    assert.equal(decoder.decode("foo.js", 27, 5), "Foo");
    assert.equal(decoder.decode("foo.js", 30, 5), "Foo.prototype.method1");
    assert.equal(decoder.decode("foo.js", 33, 5), "Foo.prototype.get prop");
    assert.equal(decoder.decode("foo.js", 36, 5), "Foo.prototype.set prop");
    assert.equal(decoder.decode("foo.js", 4, 0), "<top-level>");

    assert.equal(decoder.decode("bar.js", 2, 5), "Bar");
    assert.equal(decoder.decode("bar.js", 6, 5), "Bar.prototype.get prop");
    assert.equal(decoder.decode("bar.js", 9, 5), "Bar.prototype.set prop");
    assert.equal(decoder.decode("bar.js", 14, 5), "f1");
    assert.equal(decoder.decode("bar.js", 18, 5), "bar1");
    assert.equal(decoder.decode("bar.js", 22, 5), "bar2");
    assert.equal(decoder.decode("bar.js", 25, 0), "bar3");
    assert.equal(decoder.decode("bar.js", 25, 52), "bar3");
    assert.equal(decoder.decode("bar.js", 25, 39), "<anonymous>");
    assert.equal(decoder.decode("bar.js", 12, 5), "<top-level>");
});
