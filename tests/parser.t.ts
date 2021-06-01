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

import * as assert from "assert";

import { parse } from "../src/parser.js";
import { FileType } from "../src/types.js";
import { JSONFromFile, readFile } from "./helper.t.js";

it("parser module tests", () => {
    const CASES: [string, FileType][] = [
        ["empty.ts", "TypeScript"],
        ["declaration.js", "ECMAScript"],
        ["expression.js", "ECMAScript"],
        ["async.js", "ECMAScript"],
        ["generator.js", "ECMAScript"],
        ["arrow.js", "ECMAScript"],
        ["nesting.js", "ECMAScript"],
        ["class.js", "ECMAScript"],
        ["objectLiteral.js", "ECMAScript"],
        ["objectLiteralNesting.js", "ECMAScript"],
        ["typescript.ts", "TypeScript"],
        ["class.ts", "TypeScript"],
        ["simple.tsx", "TSX"],
        ["simple.jsx", "JSX"],
        ["lhsVariations.js", "ECMAScript"],
        ["lhsVariationsArrow.js", "ECMAScript"],
        ["lhsVariationsLocalName.js", "ECMAScript"],
        ["classVariations.ts", "TypeScript"],
    ];

    for (const [file, fileType] of CASES) {
        const functionDescFile = `${file}.function_descs.json`;
        const parsed = parse(readFile(file, "parser"), fileType);
        const expected = JSONFromFile(functionDescFile, "parser");
        assert.deepEqual(parsed, expected, `parsing file: ${file}`);
    }
});

it("parser module test: syntactically invalid input source", () => {
    const INVALID_CASES: [string, FileType][] = [
        ["invalid1.js", "ECMAScript"],
        ["invalid2.js", "ECMAScript"],
        ["invalid3.js", "ECMAScript"],
        ["invalid1.ts", "TypeScript"],
        ["invalid1.jsx", "JSX"],
        ["invalid1.tsx", "TSX"],
    ];

    for (const [file, fileType] of INVALID_CASES) {
        assert.throws(() => {
            parse(readFile(file, "parser"), fileType);
        });
    }
});
