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
    combineNames,
    convertToRelative,
    encode,
    encodeRelativeFunctionDescs,
} from "../src/encoder";
import { FunctionDesc } from "../src/functionDesc";
import { RelativeFunctionDesc } from "../src/types";
import { JSONFromFile as JSONFromFileInFolder } from "./helper.t";

const test: typeof import("tape") = require("tape");

function JSONFromFile(file: string) {
    return JSONFromFileInFolder(file, "codec");
}

test("encoder module test: empty function descs", (t) => {
    t.plan(1);
    // sourceMap has 2 sources - "foo.js" and "bar.js" but functionDescs is empty
    const sourceMap = JSONFromFile("simple.sourceMap.json");
    const functionsDescs = new Map<string, FunctionDesc[]>();
    const expected = {
        ...sourceMap,
        x_com_bloomberg_sourcesFunctionMappings: [null, null, null],
    };
    const actual = encode(sourceMap, functionsDescs);
    t.deepEqual(actual, expected, "empty function descs");
});

test("encoder module test: empty sources", (t) => {
    t.plan(2);
    // empty sources, empty functionDescs
    let sourceMap = JSONFromFile("emptySources.sourceMap.json");
    let functionsDescs = new Map<string, FunctionDesc[]>();
    const expected = {
        ...sourceMap,
        x_com_bloomberg_sourcesFunctionMappings: [],
    };
    let actual = encode(sourceMap, functionsDescs);
    t.deepEqual(actual, expected, "empty sources, empty function descs");

    // empty sources, non-empty functionDescs
    sourceMap = JSONFromFile("emptySources.sourceMap.json");
    functionsDescs = new Map<string, FunctionDesc[]>(
        JSONFromFile("simple.sourceToFunctionDescs.json")
    );
    actual = encode(sourceMap, functionsDescs);
    t.deepEqual(actual, expected, "empty sources, non-empty function descs");
});

test("encoder module test: simple", (t) => {
    t.plan(2);
    const sourceMap = JSONFromFile("simple.sourceMap.json");

    const functionsDescs = new Map<string, FunctionDesc[]>(
        JSONFromFile("simple.sourceToFunctionDescs.json")
    );
    let expected = JSONFromFile("simple.enrichedSourceMap.json");
    let actual = encode(sourceMap, functionsDescs);
    t.deepEqual(actual, expected);

    // reverse the function descs so they are not in order
    functionsDescs.get("simple.js")!.reverse();

    expected = JSONFromFile("simpleReversed.enrichedSourceMap.json");
    actual = encode(sourceMap, functionsDescs);
    t.deepEqual(actual, expected);
});

test("encoder module test: complex", (t) => {
    t.plan(1);
    const sourceMap = JSONFromFile("complex.sourceMap.json");

    const functionsDescs = new Map<string, FunctionDesc[]>(
        JSONFromFile("complex.sourceToFunctionDescs.json")
    );
    const expected = JSONFromFile("complex.enrichedSourceMap.json");
    const actual = encode(sourceMap, functionsDescs);
    t.deepEqual(actual, expected);
});

test("unit test: convertToRelative", (t) => {
    t.plan(5);

    // empty names
    let functionDescs = JSONFromFile("simple.functionDesc.json");
    let expected = JSONFromFile("emptyNames.relativeFunctionDesc.json");
    let actual = convertToRelative(functionDescs, [
        "<top-level>",
        "f1",
        "real",
        "<anonymous>",
    ]);
    t.deepEqual(actual, expected, "empty names");

    // names overlap with functionDescs names
    let names = [
        "src",
        "maps",
        "are",
        "real",
        "fun",
        "<top-level>",
        "f1",
        "<anonymous>",
    ];
    functionDescs = JSONFromFile("simple.functionDesc.json");
    expected = JSONFromFile("simple.relativeFunctionDesc.json");
    actual = convertToRelative(functionDescs, names);
    t.deepEqual(actual, expected, "names overlap");

    // no overlap between names and functionDescs names
    names = [
        "src",
        "maps",
        "are",
        "real",
        "fun",
        "<top-level>",
        "f1",
        "f2",
        "<anonymous>",
    ];
    functionDescs = JSONFromFile("simple.functionDescNoNamesOverlap.json");
    expected = JSONFromFile("simple.relativeFunctionDescNoNamesOverlap.json");
    actual = convertToRelative(functionDescs, names);
    t.deepEqual(actual, expected, "no names overlap");

    // function descs not in order
    // reverse the function descs, so they are in wrong order
    functionDescs = JSONFromFile(
        "simple.functionDescNoNamesOverlap.json"
    ).reverse();
    expected = JSONFromFile("simple.relativeFunctionDescNoNamesOverlap.json");
    actual = convertToRelative(functionDescs, names);
    t.deepEqual(actual, expected, "function descs in wrong order");

    // invalid nesting
    functionDescs = JSONFromFile(
        "simple.functionDescInvalidNesting.json"
    ).reverse();
    t.throws(() => {
        convertToRelative(functionDescs, names);
    });
});

test("unit test: encodeRelativeFunctionDescs", (t) => {
    t.plan(3);

    // empty test
    let actual = encodeRelativeFunctionDescs([]);
    let expected = "";
    t.deepEqual(actual, expected, "empty");

    // one entry
    actual = encodeRelativeFunctionDescs([
        new RelativeFunctionDesc(0, 0, 0, 11, 6),
    ]);
    expected = "AAAWM";
    t.deepEqual(actual, expected, "one entry");

    // multiple entries
    actual = encodeRelativeFunctionDescs([
        new RelativeFunctionDesc(0, 0, 0, 11, 6),
        new RelativeFunctionDesc(1, -10, 14, 2, -5),
        new RelativeFunctionDesc(2, 1, 2, 5, 0),
    ]);
    expected = "AAAWM,CVcEL,ECEKA";
    t.deepEqual(actual, expected, "multiple entries");
});

test("unit test: combineNames", (t) => {
    t.plan(7);

    const functionDescs = new Map<string, FunctionDesc[]>([
        [
            "foo.js",
            [
                new FunctionDesc("f1", 1, 4, 1, 4),
                new FunctionDesc("f2", 5, 6, 5, 6),
            ],
        ],
        [
            "bar.js",
            [
                new FunctionDesc("f2", 1, 4, 1, 4),
                new FunctionDesc("f3", 5, 6, 5, 6),
            ],
        ],
    ]);

    t.deepEqual(
        combineNames(["f1", "f2", "f3"], ["foo.js", "bar.js"], functionDescs),
        ["f1", "f2", "f3"]
    );
    t.deepEqual(
        combineNames(["f1", "f2"], ["foo.js", "bar.js"], functionDescs),
        ["f1", "f2", "f3"]
    );
    t.deepEqual(combineNames([], ["foo.js", "bar.js"], functionDescs), [
        "f1",
        "f2",
        "f3",
    ]);

    t.deepEqual(
        combineNames(["f1", "f2"], ["foo.js", "bar.js"], functionDescs),
        ["f1", "f2", "f3"]
    );

    t.deepEqual(combineNames([], ["foo.js"], functionDescs), ["f1", "f2"]);
    t.deepEqual(combineNames(["f1", "f3"], ["foo.js"], functionDescs), [
        "f1",
        "f3",
        "f2",
    ]);
    t.deepEqual(combineNames(["f1"], ["bar.js"], functionDescs), [
        "f1",
        "f2",
        "f3",
    ]);
});
