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

import { FunctionDesc, isPartialOverlap } from "./functionDesc";
import { EnrichedSourceMap, RelativeFunctionDesc } from "./types";

const vlq: typeof import("vlq") = require("vlq");

const _functionDescs = Symbol("functionDescs");

/**
 * Provides a utility to decode a coordinate in a source file
 * into the enclosing function name.
 */
export class SourceMapDecoder {
    private [_functionDescs]: Map<string, FunctionDesc[]>;

    /**
     * Initializes the `SourceMapDecoder`
     * @param sourceMap - a PASTA enriched source map
     *
     * @throws if the input source map is invalid
     */
    constructor(sourceMap: EnrichedSourceMap) {
        validateSourceMap(sourceMap);
        this[_functionDescs] = decodeSources(sourceMap);
    }

    /**
     * Returns the enclosing function name for the input coordinate.
     * If the input coordinate is not enclosed in a function then `null` is returned.
     *
     * @param source the source file in which the search should happen
     * @param line - zero-based line number of the coordinate
     * @param column - zero-based column number of the coordinate
     *
     * @throws if `source` is not present in the source map
     */
    public decode(
        source: string,
        line: number,
        column: number
    ): string | null {
        const descs = this[_functionDescs].get(source);
        // `null` entries in the source map become empty arrays in `[_functionDescs]`
        // so `descs === undefined` means `source` is not present in the source map
        if (!descs) {
            throw Error(`source ${source} not found in source map`);
        }
        return findInnermostEnclosingFunction(line, column, descs);
    }
}

function validateSourceMap(sourceMap: EnrichedSourceMap) {
    if (!Array.isArray(sourceMap.sources)) {
        throw Error(`sourceMap.sources is not an array`);
    }
    if (!Array.isArray(sourceMap.names)) {
        throw Error(`sourceMap.names is not an array`);
    }
    if (!sourceMap.x_com_bloomberg_sourcesFunctionMappings) {
        throw Error(
            `The source map does not contain the x_com_bloomberg_sourcesFunctionMappings field and therefore this decoder cannot be used.`
        );
    }
    if (!Array.isArray(sourceMap.x_com_bloomberg_sourcesFunctionMappings)) {
        throw Error(
            `sourceMap.x_com_bloomberg_sourcesFunctionMappings is not an array`
        );
    }
    if (
        sourceMap.sources.length !==
        sourceMap.x_com_bloomberg_sourcesFunctionMappings.length
    ) {
        throw Error(
            `sources.length !== x_com_bloomberg_sourcesFunctionMappings.length in source map. sources.length = ${sourceMap.sources.length}, x_com_bloomberg_sourcesFunctionMappings.length = ${sourceMap.x_com_bloomberg_sourcesFunctionMappings.length}`
        );
    }
}

function decodeSources(
    sourceMap: EnrichedSourceMap
): Map<string, FunctionDesc[]> {
    const functionDescs = new Map();
    sourceMap.sources.forEach((source, index) => {
        // get the encoded mappings string for source from the sourcemap
        const encodedMappingsStr =
            sourceMap.x_com_bloomberg_sourcesFunctionMappings[index];
        // decode mappings
        const decodedMappings = decodeMappings(encodedMappingsStr);
        // make the mappings absolute
        const descs = convertToAbsolute(decodedMappings, sourceMap.names);
        functionDescs.set(source, descs);
    });
    return functionDescs;
}

/**
 * @ignore Exporting for testing only
 */
export function decodeMappings(
    encodedMappingsStr: string | null
): RelativeFunctionDesc[] {
    if (encodedMappingsStr === null || encodedMappingsStr === "") {
        return [];
    }
    const encodedMappings = encodedMappingsStr.split(",");
    let decodedMappings: RelativeFunctionDesc[] = [];
    try {
        decodedMappings = encodedMappings.map(decode);
    } catch (e) {
        throw Error(
            `VLQ decode failed for ${encodedMappings} with error: ${e}`
        );
    }
    return decodedMappings;
}

function decode(encodedMapping: string) {
    const decoded = vlq.decode(encodedMapping);
    if (decoded.length !== 5) {
        throw Error(
            `Bad mapping ${encodedMapping} in source map. Decoded mapping must have 5 elements but has ${decoded.length}`
        );
    }
    const tuple = decoded as [number, number, number, number, number];
    return new RelativeFunctionDesc(...tuple);
}

/**
 * @ignore Exporting for testing only
 */
export function convertToAbsolute(
    decodedMappings: RelativeFunctionDesc[],
    names: string[]
): FunctionDesc[] {
    let prev = new FunctionDesc("", 0, 0, 0, 0);
    let prevNameIndex = 0;
    const functionDescs: FunctionDesc[] = [];
    for (const mapping of decodedMappings) {
        const {
            nameIndex: relNameIndex,
            startLine: relStartLine,
            startColumn: relStartColumn,
            endLine: relEndLine,
            endColumn: relEndColumn,
        } = mapping;

        const absoluteNameIndex = relNameIndex + prevNameIndex;
        if (absoluteNameIndex < 0 || absoluteNameIndex >= names.length) {
            throw Error(
                `Name index is out of range. nameIndex = ${absoluteNameIndex}, names.length=${names.length}`
            );
        }
        const name = names[absoluteNameIndex];
        const functionDesc = new FunctionDesc(
            name,
            relStartLine + prev.endLine,
            relStartColumn + prev.startColumn,
            relEndLine + (relStartLine + prev.endLine),
            relEndColumn + prev.endColumn
        );
        validateFunctionPositions(prev, functionDesc);

        functionDescs.push(functionDesc);
        prev = functionDesc;
        prevNameIndex = absoluteNameIndex;
    }
    return functionDescs;
}

function validateFunctionPositions(prev: FunctionDesc, current: FunctionDesc) {
    // Validate that start position of `prev` is before start position of `current`
    if (
        current.startLine < prev.startLine ||
        (current.startLine === prev.startLine &&
            current.startColumn < prev.startColumn)
    ) {
        throw Error("Function mappings are not ordered");
    }
    // Validate that if `prev` overlaps with `current`
    // then it is fully nested rather than partially overlapping
    if (isPartialOverlap(current, prev)) {
        throw Error("Invalid nesting in function mappings");
    }
}

/**
 * @ignore Exporting for testing only
 */
export function findInnermostEnclosingFunction(
    line: number,
    column: number,
    functionDescs: FunctionDesc[]
): string | null {
    // functions are ordered (by line, then colum), so we can walk the
    // array backwards and safely assume that the first match is the
    // innermost enclosing function
    for (let i = functionDescs.length - 1; i >= 0; --i) {
        const d = functionDescs[i];
        let match = false;
        const { startLine, startColumn, endLine, endColumn } = d;
        if (startLine !== endLine) {
            match =
                (line > startLine && line < endLine) ||
                (line === startLine && column >= startColumn) ||
                (line === endLine && column <= endColumn);
        } else {
            match =
                line === startLine &&
                column >= startColumn &&
                column <= endColumn;
        }
        if (match) {
            return d.name;
        }
    }
    return null;
}
