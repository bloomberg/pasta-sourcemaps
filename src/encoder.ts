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

import { SourceMapDecoder } from "./decoder";
import {
    compareFunction,
    FunctionDesc,
    isPartialOverlap,
} from "./functionDesc";
import { EnrichedSourceMap, RelativeFunctionDesc, SourceMap } from "./types";
const vlq: typeof import("vlq") = require("vlq");

const isDevelopment = process.env.NODE_ENV === "development";

/**
 * Produces a PASTA enriched source map based on the input source map and the input
 * function descriptions. The enriched source map differs from the input source map in these
 * two ways:
 * 1) Any function names not already present in the `names` field get appended to it
 * 2) The function descriptions for each source get encoded into Base64 VLQ encoding, and the
 * encoded values get added to the `x_com_bloomberg_sourcesFunctionMappings` field.
 *
 * @param sourceMap - input source map
 * @param functionDescs - a map of function descriptions for each source in the source map.
 * The keys in the map must match elements in source map `sources` exactly.
 * @returns PASTA enriched source map
 *
 * @throws if `functionDescs` for a source contains partial overlaps
 */
export function encode(
    sourceMap: SourceMap,
    functionDescs: Map<string, FunctionDesc[]>
): EnrichedSourceMap {
    validateSourceMap(sourceMap);
    const names = combineNames(
        sourceMap.names,
        sourceMap.sources,
        functionDescs
    );
    const sourcesFunctionMappings = sourceMap.sources.map((source) => {
        const descs = functionDescs.get(source);
        if (!descs) {
            // If a source doesn't have mappings provided then we will have
            // `null` in x_com_bloomberg_sourcesFunctionMappings for that source
            return null;
        }
        const relativeDescs = convertToRelative(descs, names);
        return encodeRelativeFunctionDescs(relativeDescs);
    });
    const enriched = {
        ...sourceMap,
        names: names,
        x_com_bloomberg_sourcesFunctionMappings: sourcesFunctionMappings,
    };
    validateEnrichedSourceMap(enriched);
    return enriched;
}

function validateSourceMap(sourceMap: SourceMap) {
    if (!Array.isArray(sourceMap.sources)) {
        throw Error(`sourceMap.sources is not an array`);
    }
    if (!Array.isArray(sourceMap.names)) {
        throw Error(`sourceMap.names is not an array`);
    }
}

function validateEnrichedSourceMap(enrichedSourceMap: EnrichedSourceMap) {
    if (isDevelopment) {
        // Development only, validate that the result can be decoded by the decoder
        new SourceMapDecoder(enrichedSourceMap);
    }
}

function validateNesting(functionDescs: FunctionDesc[]) {
    let prev = new FunctionDesc("", 0, 0, 0, 0);
    for (const desc of functionDescs) {
        if (isPartialOverlap(desc, prev)) {
            throw Error("Invalid nesting in function mappings");
        }
        prev = desc;
    }
}

/**
 * @ignore Exporting for testing only
 */
export function combineNames(
    sourceMapNames: string[],
    sourceMapSources: string[],
    functionDescs: Map<string, FunctionDesc[]>
): string[] {
    const names = getNamesFromRelevantSources(sourceMapSources, functionDescs);
    const extraNames = calculateAdditionalNames(sourceMapNames, names);
    return [...sourceMapNames, ...extraNames];
}

function getNamesFromRelevantSources(
    sources: string[],
    functionDescs: Map<string, FunctionDesc[]>
): string[] {
    const names: Set<string> = new Set();
    functionDescs.forEach((descs, source) => {
        if (sources.includes(source)) {
            for (const desc of descs) {
                names.add(desc.name);
            }
        }
    });
    return [...names];
}

function calculateAdditionalNames(
    existingNames: string[],
    newNames: string[]
) {
    const existingNamesSet = new Set(existingNames);
    return newNames.filter((x) => !existingNamesSet.has(x));
}

/**
 * @ignore Exporting for testing only
 */
export function convertToRelative(
    descs: FunctionDesc[],
    functionNames: string[]
): RelativeFunctionDesc[] {
    const relativeDescs: RelativeFunctionDesc[] = [];
    const sortedDescs = [...descs].sort(compareFunction);
    validateNesting(sortedDescs);

    let prev = new FunctionDesc("", 0, 0, 0, 0);
    let prevNameIx = 0;
    for (const desc of sortedDescs) {
        // figure out index
        const nameIx = functionNames.indexOf(desc.name);

        // figure out relative positioning
        const relativeDesc = new RelativeFunctionDesc(
            nameIx - prevNameIx,
            desc.startLine - prev.endLine,
            desc.startColumn - prev.startColumn,
            desc.endLine - desc.startLine,
            desc.endColumn - prev.endColumn
        );
        relativeDescs.push(relativeDesc);

        // set prev to current
        prev = desc;
        prevNameIx = nameIx;
    }
    return relativeDescs;
}

/**
 * @ignore Exporting for testing only
 */
export function encodeRelativeFunctionDescs(
    relativeDescs: RelativeFunctionDesc[]
): string {
    const encodedDescs = relativeDescs.map((x) =>
        vlq.encode([
            x.nameIndex,
            x.startLine,
            x.startColumn,
            x.endLine,
            x.endColumn,
        ])
    );
    return encodedDescs.join(",");
}
