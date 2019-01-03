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

import {
    convertToAbsolute,
    decodeMappings,
    findInnermostEnclosingFunction,
    SourceMapDecoder,
} from "../src/decoder";
import { FunctionDesc } from "../src/functionDesc";
import { RelativeFunctionDesc } from "../src/types";
import { JSONFromFile as JSONFromFileInFolder } from "./helper.t";

const test: typeof import("tape") = require("tape");

function JSONFromFile(file: string) {
    return JSONFromFileInFolder(file, "codec");
}

test("decoder module test: bad sourcemap", (t) => {
    const badSourceMapFiles = [
        "invalid.lengthMismatch.enrichedSourceMap.json", // source.length != x_com_bloomberg_sourcesFunctionMappings.length
        "invalid.badVLQ1.enrichedSourceMap.json", // "foo.js" mappings is an array of 7 elements
        "invalid.badVLQ2.enrichedSourceMap.json", // "foo.js" mappings contains invalid (unterminated) VLQ
        "invalid.badVLQ3.enrichedSourceMap.json", // "foo.js" mappings contains illegal characters VLQ
        "invalid.emptyStringMapping.enrichedSourceMap.json", // "foo.js" mappings is an empty string
    ];
    t.plan(badSourceMapFiles.length);
    for (const file of badSourceMapFiles) {
        const sourceMap = JSONFromFile(file);
        t.throws(() => {
            new SourceMapDecoder(sourceMap); // tslint:disable-line no-unused-expression
        });
    }
});

test("decoder module test: empty sources", (t) => {
    t.plan(1);
    const sourceMap = JSONFromFile("emptySources.enrichedSourceMap.json");
    const decoder = new SourceMapDecoder(sourceMap);
    t.throws(() => {
        decoder.decode("foo.js", 0, 0);
    });
});

test("decoder module test: simple", (t) => {
    t.plan(11);
    const sourceMap = JSONFromFile("simple.enrichedSourceMap.json");
    const decoder = new SourceMapDecoder(sourceMap);

    // "bar.js" not in sources
    t.throws(() => {
        decoder.decode("bar.js", 0, 0);
    });

    // "foo.js" present in sources, but mappings = ""
    let actual = decoder.decode("foo.js", 1, 1);
    let expected = null;
    t.deepEqual(actual, expected, "no mappings available for source");

    // "bob.js" present in sources, but mappings = null
    actual = decoder.decode("bob.js", 1, 1);
    expected = null;
    t.deepEqual(actual, expected, "no mappings available for source");

    // line out of range, expect null
    actual = decoder.decode("simple.js", 50, 0);
    expected = null;
    t.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("simple.js", 0, 5);
    expected = "<top-level>";
    t.deepEqual(actual, expected);

    // no column 20 in the file, but that's ok
    actual = decoder.decode("simple.js", 0, 20);
    expected = "f1";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("simple.js", 2, 0);
    expected = "f1";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("simple.js", 5, 1);
    expected = "real";
    t.deepEqual(actual, expected);

    // nested function match
    actual = decoder.decode("simple.js", 6, 1);
    expected = "<anonymous>";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("simple.js", 8, 1);
    expected = "real";
    t.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("simple.js", 11, 1);
    expected = "<top-level>";
    t.deepEqual(actual, expected);
});

test("decoder module test: complex", (t) => {
    t.plan(12);
    const sourceMap = JSONFromFile("complex.enrichedSourceMap.json");
    const decoder = new SourceMapDecoder(sourceMap);

    // function match
    let actual = decoder.decode("complex.js", 1, 0);
    let expected = "f1";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 2, 20);
    expected = "f1";
    t.deepEqual(actual, expected);

    // nested match (anon function expression)
    actual = decoder.decode("complex.js", 3, 20);
    expected = "<anonymous>";
    t.deepEqual(actual, expected);

    // nested match (arrow function)
    actual = decoder.decode("complex.js", 4, 25);
    expected = "<anonymous>";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 5, 10);
    expected = "f1";
    t.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("complex.js", 8, 0);
    expected = "<top-level>";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 10, 1);
    expected = "x";
    t.deepEqual(actual, expected);

    // nested match
    actual = decoder.decode("complex.js", 11, 2);
    expected = "y";
    t.deepEqual(actual, expected);

    // double nested match
    actual = decoder.decode("complex.js", 12, 10);
    expected = "z";
    t.deepEqual(actual, expected);

    // nested match
    actual = decoder.decode("complex.js", 14, 15);
    expected = "y";
    t.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 16, 5);
    expected = "x";
    t.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("complex.js", 18, 5);
    expected = "<top-level>";
    t.deepEqual(actual, expected);
});

test("decoder unit test: decodeMappings", (t) => {
    t.plan(8);

    let actual = decodeMappings(null);
    let expected: RelativeFunctionDesc[] = [];
    t.deepEqual(actual, expected);

    // empty string
    expected = [];
    actual = decodeMappings("");
    t.deepEqual(actual, expected);

    // valid VLQ but decoded value contains 2 elements instead of 5
    t.throws(() => {
        decodeMappings("AB");
    });

    // bad VLQ - illegal characters
    t.throws(() => {
        decodeMappings("%£@");
    });

    // bad VLQ - unterminated sequence
    t.throws(() => {
        decodeMappings("ASFs");
    });

    // VLQ good but decoded array has 3 elements instead of 5
    t.throws(() => {
        decodeMappings("XHF");
    });

    actual = decodeMappings("AAAWM");
    expected = [new RelativeFunctionDesc(0, 0, 0, 11, 6)];
    t.deepEqual(actual, expected);

    actual = decodeMappings("AAAWM,CVcEL,ECEKA");
    expected = [
        new RelativeFunctionDesc(0, 0, 0, 11, 6),
        new RelativeFunctionDesc(1, -10, 14, 2, -5),
        new RelativeFunctionDesc(2, 1, 2, 5, 0),
    ];
    t.deepEqual(actual, expected);
});

test("decoder unit test: convertToAbsolute", (t) => {
    t.plan(2);
    const sourceMap = JSONFromFile("simple.enrichedSourceMap.json");

    // good input
    let relativeDescs = [
        new RelativeFunctionDesc(5, 0, 0, 11, 6),
        new RelativeFunctionDesc(1, -10, 14, 2, -5),
        new RelativeFunctionDesc(-3, 1, 2, 5, 0),
        new RelativeFunctionDesc(4, -4, 0, 2, 5),
    ];
    let actual = convertToAbsolute(relativeDescs, sourceMap.names);
    let expected = [
        new FunctionDesc("<top-level>", 0, 0, 11, 6),
        new FunctionDesc("f1", 1, 14, 3, 1),
        new FunctionDesc("real", 4, 16, 9, 1),
        new FunctionDesc("<anonymous>", 5, 16, 7, 6),
    ];
    t.deepEqual(actual, expected);

    // empty input
    relativeDescs = [];
    actual = convertToAbsolute(relativeDescs, sourceMap.names);
    expected = [];
    t.deepEqual(actual, expected);
});

test("decoder unit test: convertToAbsolute bad inputs", (t) => {
    const sourceMap = JSONFromFile("simple.enrichedSourceMap.json");
    const badInputs = [
        [new RelativeFunctionDesc(0, -1, 0, -1, 0)], // negative positions
        [new RelativeFunctionDesc(0, 10, 0, -5, 0)], // startLine > endLine
        [new RelativeFunctionDesc(0, 10, 5, 0, 0)], // startLine === endLine, startColumn > endColumn
        [new RelativeFunctionDesc(-4, 0, 0, 0, 0)], // name index negative for first element
        [
            new RelativeFunctionDesc(2, 0, 0, 0, 0),
            new RelativeFunctionDesc(-3, 2, 5, 2, 5),
        ], // name index negative for second element
        [new RelativeFunctionDesc(20, 0, 0, 0, 0)], // name index out of range for first element
        [
            new RelativeFunctionDesc(5, 0, 0, 0, 0),
            new RelativeFunctionDesc(15, 2, 2, 10, 10),
        ], // name index out of range for second element
        [
            new RelativeFunctionDesc(0, 0, 0, 1, 0),
            new RelativeFunctionDesc(1, 10, 0, 10, 0),
            new RelativeFunctionDesc(1, -15, 0, 3, 0),
        ], // functions not ordered by line number
        [
            new RelativeFunctionDesc(0, 0, 0, 1, 0),
            new RelativeFunctionDesc(1, 10, 0, 10, 0),
            new RelativeFunctionDesc(1, -5, 0, 10, 0),
        ], // bad nesting
    ];
    t.plan(badInputs.length);
    for (const relDescs of badInputs) {
        t.throws(() => {
            convertToAbsolute(relDescs, sourceMap.names);
        });
    }
});

test("decoder unit test: findInnermostEnclosingFunction", (t) => {
    t.plan(14);

    let functionDescs = [
        new FunctionDesc("<top-level>", 0, 0, 21, 0),
        new FunctionDesc("f1", 1, 0, 8, 0),
        new FunctionDesc("f2", 4, 5, 6, 3),
        new FunctionDesc("<anonymous>", 5, 10, 5, 20),
        new FunctionDesc("x", 10, 0, 18, 1),
    ];
    let actual = findInnermostEnclosingFunction(0, 1, functionDescs);
    let expected = "<top-level>";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(3, 5, functionDescs);
    expected = "f1";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(5, 1, functionDescs);
    expected = "f2";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(5, 12, functionDescs);
    expected = "<anonymous>";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(9, 0, functionDescs);
    expected = "<top-level>";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(13, 20, functionDescs);
    expected = "x";
    t.deepEqual(actual, expected);

    // all functions on one line
    functionDescs = [
        new FunctionDesc("<top-level>", 0, 0, 10, 0),
        new FunctionDesc("f1", 1, 0, 1, 20),
        new FunctionDesc("f2", 1, 2, 1, 18),
        new FunctionDesc("f3", 1, 4, 1, 16),
    ];

    actual = findInnermostEnclosingFunction(0, 5, functionDescs.slice());
    expected = "<top-level>";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 1, functionDescs.slice());
    expected = "f1";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 3, functionDescs.slice());
    expected = "f2";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 5, functionDescs.slice());
    expected = "f3";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 15, functionDescs.slice());
    expected = "f3";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 17, functionDescs.slice());
    expected = "f2";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 19, functionDescs.slice());
    expected = "f1";
    t.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 21, functionDescs.slice());
    expected = "<top-level>";
    t.deepEqual(actual, expected);
});
