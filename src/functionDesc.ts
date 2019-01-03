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
 * Represents a function in a source file.
 * A function is represented by a name, and start and end coordinates.
 */
export class FunctionDesc {
    public name: string;
    public startLine: number;
    public startColumn: number;
    public endLine: number;
    public endColumn: number;

    constructor(
        name: string,
        startLine: number,
        startColumn: number,
        endLine: number,
        endColumn: number
    ) {
        if (startLine < 0 || startColumn < 0 || endLine < 0 || endColumn < 0) {
            throw new Error(
                `Line and column positions should be positive but were not: startLine=${startLine}, startColumn=${startColumn}, endLine=${endLine}, endColumn=${endColumn}`
            );
        }
        if (
            startLine > endLine ||
            (startLine === endLine && startColumn > endColumn)
        ) {
            throw new Error(
                `End position should be greater than start position: startLine=${startLine}, startColumn=${startColumn}, endLine=${endLine}, endColumn=${endColumn}`
            );
        }
        this.name = name;
        this.startLine = startLine;
        this.startColumn = startColumn;
        this.endLine = endLine;
        this.endColumn = endColumn;
    }
}

/**
 * @ignore Not exported outside of package
 */
export function isPartialOverlap(a: FunctionDesc, b: FunctionDesc): boolean {
    if (compareFunction(a, b) < 0) {
        [a, b] = [b, a];
    }
    // `a` starts after `b` start
    return (
        (a.startLine < b.endLine ||
            (a.startLine === b.endLine && a.startColumn < b.endColumn)) &&
        (a.endLine > b.endLine ||
            (a.endLine === b.endLine && a.endColumn > b.endColumn))
    );
}

/**
 * @ignore Not exported outside of package
 */
export function compareFunction(a: FunctionDesc, b: FunctionDesc) {
    if (a.startLine < b.startLine) {
        return -1;
    } else if (a.startLine > b.startLine) {
        return 1;
    }
    if (a.startColumn < b.startColumn) {
        return -1;
    } else if (a.startColumn > b.startColumn) {
        return 1;
    }
    return 0;
}
