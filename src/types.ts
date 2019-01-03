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

/**
 * Represents a source map.
 */
export interface SourceMap {
    version: number;
    sources: string[];
    names: string[];
    mappings: string;
    file?: string;
    sourceRoot?: string;
    sourcesContent?: (string | null)[];
}

/**
 * Represents a PASTA enriched source map.
 * The additional field stores function mappings.
 */
export interface EnrichedSourceMap extends SourceMap {
    x_com_bloomberg_sourcesFunctionMappings: (string | null)[];
}

export type FileType = "TypeScript" | "ECMAScript" | "TSX" | "JSX";

/**
 * @ignore Not exported outside of package
 */
export class RelativeFunctionDesc {
    public nameIndex: number;
    public startLine: number;
    public startColumn: number;
    public endLine: number;
    public endColumn: number;
    constructor(
        nameIndex: number,
        startLine: number,
        startColumn: number,
        endLine: number,
        endColumn: number
    ) {
        this.nameIndex = nameIndex;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }
}
