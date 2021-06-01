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
} from "../src/decoder.js";
import { FunctionDesc } from "../src/functionDesc.js";
import { RelativeFunctionDesc } from "../src/types.js";
import { JSONFromFile as JSONFromFileInFolder } from "./helper.t.js";

import * as assert from "assert";

function JSONFromFile(file: string) {
    return JSONFromFileInFolder(file, "codec");
}

it("decoder module test: bad sourcemap", () => {
    const badSourceMapFiles = [
        "invalid.lengthMismatch.enrichedSourceMap.json", // source.length != x_com_bloomberg_sourcesFunctionMappings.length
        "invalid.badVLQ1.enrichedSourceMap.json", // "foo.js" mappings is an array of 7 elements
        "invalid.badVLQ2.enrichedSourceMap.json", // "foo.js" mappings contains invalid (unterminated) VLQ
        "invalid.badVLQ3.enrichedSourceMap.json", // "foo.js" mappings contains illegal characters VLQ
        "invalid.emptyStringMapping.enrichedSourceMap.json", // "foo.js" mappings is an empty string
    ];

    for (const file of badSourceMapFiles) {
        const sourceMap = JSONFromFile(file);
        assert.throws(() => {
            new SourceMapDecoder(sourceMap); // tslint:disable-line no-unused-expression
        });
    }
});

it("decoder module test: empty sources", () => {
    const sourceMap = JSONFromFile("emptySources.enrichedSourceMap.json");
    const decoder = new SourceMapDecoder(sourceMap);
    assert.throws(() => {
        decoder.decode("foo.js", 0, 0);
    });
});

it("decoder module test: simple", () => {
    const sourceMap = JSONFromFile("simple.enrichedSourceMap.json");
    const decoder = new SourceMapDecoder(sourceMap);

    // "bar.js" not in sources
    assert.throws(() => {
        decoder.decode("bar.js", 0, 0);
    });

    // "foo.js" present in sources, but mappings = ""
    let actual = decoder.decode("foo.js", 1, 1);
    let expected = null;
    assert.deepEqual(actual, expected, "no mappings available for source");

    // "bob.js" present in sources, but mappings = null
    actual = decoder.decode("bob.js", 1, 1);
    expected = null;
    assert.deepEqual(actual, expected, "no mappings available for source");

    // line out of range, expect null
    actual = decoder.decode("simple.js", 50, 0);
    expected = null;
    assert.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("simple.js", 0, 5);
    expected = "<top-level>";
    assert.deepEqual(actual, expected);

    // no column 20 in the file, but that's ok
    actual = decoder.decode("simple.js", 0, 20);
    expected = "f1";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("simple.js", 2, 0);
    expected = "f1";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("simple.js", 5, 1);
    expected = "real";
    assert.deepEqual(actual, expected);

    // nested function match
    actual = decoder.decode("simple.js", 6, 1);
    expected = "<anonymous>";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("simple.js", 8, 1);
    expected = "real";
    assert.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("simple.js", 11, 1);
    expected = "<top-level>";
    assert.deepEqual(actual, expected);
});

it("decoder module test: complex", () => {
    const sourceMap = JSONFromFile("complex.enrichedSourceMap.json");
    const decoder = new SourceMapDecoder(sourceMap);

    // function match
    let actual = decoder.decode("complex.js", 1, 0);
    let expected = "f1";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 2, 20);
    expected = "f1";
    assert.deepEqual(actual, expected);

    // nested match (anon function expression)
    actual = decoder.decode("complex.js", 3, 20);
    expected = "<anonymous>";
    assert.deepEqual(actual, expected);

    // nested match (arrow function)
    actual = decoder.decode("complex.js", 4, 25);
    expected = "<anonymous>";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 5, 10);
    expected = "f1";
    assert.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("complex.js", 8, 0);
    expected = "<top-level>";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 10, 1);
    expected = "x";
    assert.deepEqual(actual, expected);

    // nested match
    actual = decoder.decode("complex.js", 11, 2);
    expected = "y";
    assert.deepEqual(actual, expected);

    // double nested match
    actual = decoder.decode("complex.js", 12, 10);
    expected = "z";
    assert.deepEqual(actual, expected);

    // nested match
    actual = decoder.decode("complex.js", 14, 15);
    expected = "y";
    assert.deepEqual(actual, expected);

    // function match
    actual = decoder.decode("complex.js", 16, 5);
    expected = "x";
    assert.deepEqual(actual, expected);

    // top-level match
    actual = decoder.decode("complex.js", 18, 5);
    expected = "<top-level>";
    assert.deepEqual(actual, expected);
});

it("decoder unit test: decodeMappings", () => {
    let actual = decodeMappings(null);
    let expected: RelativeFunctionDesc[] = [];
    assert.deepEqual(actual, expected);

    // empty string
    expected = [];
    actual = decodeMappings("");
    assert.deepEqual(actual, expected);

    // valid VLQ but decoded value contains 2 elements instead of 5
    assert.throws(() => {
        decodeMappings("AB");
    });

    // bad VLQ - illegal characters
    assert.throws(() => {
        decodeMappings("%£@");
    });

    // bad VLQ - unterminated sequence
    assert.throws(() => {
        decodeMappings("ASFs");
    });

    // VLQ good but decoded array has 3 elements instead of 5
    assert.throws(() => {
        decodeMappings("XHF");
    });

    actual = decodeMappings("AAAWM");
    expected = [new RelativeFunctionDesc(0, 0, 0, 11, 6)];
    assert.deepEqual(actual, expected);

    actual = decodeMappings("AAAWM,CVcEL,ECEKA");
    expected = [
        new RelativeFunctionDesc(0, 0, 0, 11, 6),
        new RelativeFunctionDesc(1, -10, 14, 2, -5),
        new RelativeFunctionDesc(2, 1, 2, 5, 0),
    ];
    assert.deepEqual(actual, expected);
});

it("decoder unit test: convertToAbsolute", () => {
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
    assert.deepEqual(actual, expected);

    // empty input
    relativeDescs = [];
    actual = convertToAbsolute(relativeDescs, sourceMap.names);
    expected = [];
    assert.deepEqual(actual, expected);
});

it("decoder unit test: convertToAbsolute bad inputs", () => {
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
    for (const relDescs of badInputs) {
        assert.throws(() => {
            convertToAbsolute(relDescs, sourceMap.names);
        });
    }
});

it("decoder unit test: findInnermostEnclosingFunction", () => {
    let functionDescs = [
        new FunctionDesc("<top-level>", 0, 0, 21, 0),
        new FunctionDesc("f1", 1, 0, 8, 0),
        new FunctionDesc("f2", 4, 5, 6, 3),
        new FunctionDesc("<anonymous>", 5, 10, 5, 20),
        new FunctionDesc("x", 10, 0, 18, 1),
    ];
    let actual = findInnermostEnclosingFunction(0, 1, functionDescs);
    let expected = "<top-level>";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(3, 5, functionDescs);
    expected = "f1";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(5, 1, functionDescs);
    expected = "f2";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(5, 12, functionDescs);
    expected = "<anonymous>";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(9, 0, functionDescs);
    expected = "<top-level>";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(13, 20, functionDescs);
    expected = "x";
    assert.deepEqual(actual, expected);

    // all functions on one line
    functionDescs = [
        new FunctionDesc("<top-level>", 0, 0, 10, 0),
        new FunctionDesc("f1", 1, 0, 1, 20),
        new FunctionDesc("f2", 1, 2, 1, 18),
        new FunctionDesc("f3", 1, 4, 1, 16),
    ];

    actual = findInnermostEnclosingFunction(0, 5, functionDescs.slice());
    expected = "<top-level>";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 1, functionDescs.slice());
    expected = "f1";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 3, functionDescs.slice());
    expected = "f2";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 5, functionDescs.slice());
    expected = "f3";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 15, functionDescs.slice());
    expected = "f3";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 17, functionDescs.slice());
    expected = "f2";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 19, functionDescs.slice());
    expected = "f1";
    assert.deepEqual(actual, expected);

    actual = findInnermostEnclosingFunction(1, 21, functionDescs.slice());
    expected = "<top-level>";
    assert.deepEqual(actual, expected);
});
