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

import { encode, FunctionDesc, parse, SourceMapDecoder } from "../src/main";
import {
    JSONFromFile as JSONFromFileInFolder,
    readFile as readFileInFolder,
} from "./helper.t";

const test: typeof import("tape") = require("tape");

function JSONFromFile(file: string) {
    return JSONFromFileInFolder(file, "integration");
}

function readFile(file: string) {
    return readFileInFolder(file, "integration");
}

test("integration test", (t) => {
    t.plan(21);

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

    t.deepEqual(decoder.decode("foo.js", 2, 5), "f1");
    t.deepEqual(decoder.decode("foo.js", 7, 5), "f2");
    t.deepEqual(decoder.decode("foo.js", 11, 5), "f3");
    t.deepEqual(decoder.decode("foo.js", 15, 5), "f4");
    t.deepEqual(decoder.decode("foo.js", 17, 5), "f5");
    t.deepEqual(decoder.decode("foo.js", 19, 5), "<anonymous>");
    t.deepEqual(decoder.decode("foo.js", 27, 5), "Foo");
    t.deepEqual(decoder.decode("foo.js", 30, 5), "method1");
    t.deepEqual(decoder.decode("foo.js", 33, 5), "get prop");
    t.deepEqual(decoder.decode("foo.js", 36, 5), "set prop");
    t.deepEqual(decoder.decode("foo.js", 4, 0), "<top-level>");

    t.deepEqual(decoder.decode("bar.js", 2, 5), "Bar");
    t.deepEqual(decoder.decode("bar.js", 6, 5), "get prop");
    t.deepEqual(decoder.decode("bar.js", 9, 5), "set prop");
    t.deepEqual(decoder.decode("bar.js", 14, 5), "f1");
    t.deepEqual(decoder.decode("bar.js", 18, 5), "bar1");
    t.deepEqual(decoder.decode("bar.js", 22, 5), "bar2");
    t.deepEqual(decoder.decode("bar.js", 25, 0), "bar3");
    t.deepEqual(decoder.decode("bar.js", 25, 52), "bar3");
    t.deepEqual(decoder.decode("bar.js", 25, 39), "<anonymous>");
    t.deepEqual(decoder.decode("bar.js", 12, 5), "<top-level>");
});
