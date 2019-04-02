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

import { FunctionDesc } from "../src/functionDesc";
import { FileType } from "./types";

import * as ts from "typescript";

/**
 * Parse a source file and return descriptions of all functions present in the
 * source file. Each description includes the name of the function, and start and
 * end coordinates. For anonymous functions the name is "<anonymous>".
 *
 * @param source - the contents of a source file
 * @param filetype - the type of the source file (e.g. ECMAScript or TypeScript)
 *
 * @throws if the filetype is not supported, or if the source file cannot be parsed.
 */
export function parse(source: string, filetype: FileType): FunctionDesc[] {
    switch (filetype) {
        case "TypeScript":
        case "ECMAScript":
        case "TSX":
        case "JSX":
            return parseTS(source, filetype);
        default:
            throw Error(`Unsupported FileType provided: ${filetype}`);
    }
}

const tsScriptKind: ReadonlyMap<string, ts.ScriptKind> = new Map([
    ["TypeScript", ts.ScriptKind.TS],
    ["ECMAScript", ts.ScriptKind.JS],
    ["TSX", ts.ScriptKind.TSX],
    ["JSX", ts.ScriptKind.JSX],
]);

function parseTS(source: string, filetype: FileType): FunctionDesc[] {
    const scriptKind = tsScriptKind.get(filetype);
    const tsSource = ts.createSourceFile(
        "",
        source,
        ts.ScriptTarget.ESNext,
        true, // setParentNodes
        scriptKind
    );
    validateScript(tsSource);
    const topLevelDesc = visitSourceNode(tsSource);
    const otherDescs = traverseNode(tsSource);
    return [topLevelDesc, ...otherDescs];
}

let _program: ts.Program;
function getExpensiveProgram() {
    return _program || (_program = ts.createProgram([""], {}));
}

function validateScript(tsSource: ts.SourceFile) {
    const program = getExpensiveProgram();
    const diag = program.getSyntacticDiagnostics(tsSource);
    if (diag.length > 0) {
        throw Error(`Syntax error in source, ${diag[0].messageText}`);
    }
}

function traverseNode(
    source: ts.SourceFile,
    node: ts.Node = source
): FunctionDesc[] {
    const functionDescs: FunctionDesc[] = [];
    if (
        ts.isFunctionDeclaration(node) ||
        ts.isFunctionExpression(node) ||
        ts.isArrowFunction(node) ||
        ts.isMethodDeclaration(node) ||
        ts.isConstructorDeclaration(node) ||
        ts.isGetAccessorDeclaration(node) ||
        ts.isSetAccessorDeclaration(node)
    ) {
        functionDescs.push(...visitFunctionNode(node, source));
    }
    node.getChildren().forEach((c) =>
        functionDescs.push(...traverseNode(source, c))
    );
    return functionDescs;
}

function visitFunctionNode(
    node: ts.FunctionLikeDeclaration,
    source: ts.SourceFile
): FunctionDesc[] {
    if (node.body) {
        const name = getFunctionName(node);
        const { startLine, startColumn, endLine, endColumn } = getPosition(
            node,
            source
        );
        return [
            new FunctionDesc(name, startLine, startColumn, endLine, endColumn),
        ];
    }
    return [];
}

function visitSourceNode(source: ts.SourceFile): FunctionDesc {
    const name = "<top-level>";
    const { startLine, startColumn, endLine, endColumn } = getPosition(
        source,
        source
    );
    return new FunctionDesc(name, startLine, startColumn, endLine, endColumn);
}

function getPosition(
    range: ts.TextRange,
    source: ts.SourceFile
): {
    startLine: number;
    startColumn: number;
    endLine: number;
    endColumn: number;
} {
    const { pos, end } = range;
    const {
        line: startLine,
        character: startColumn,
    } = source.getLineAndCharacterOfPosition(pos);
    const {
        line: endLine,
        character: endColumn,
    } = source.getLineAndCharacterOfPosition(end);
    return {
        startLine,
        startColumn,
        endLine,
        endColumn,
    };
}

function getFunctionName(func: ts.FunctionLikeDeclaration): string {
    let nameText = "<anonymous>";
    const name = func.name;
    if (name) {
        nameText = getNameText(name, func) || nameText;
    } else if (ts.isConstructorDeclaration(func)) {
        if (ts.isClassDeclaration(func.parent)) {
            const className = func.parent.name;
            if (className && ts.isIdentifier(className)) {
                nameText = className.text;
            }
        }
    } else {
        if (ts.isFunctionExpression(func) || ts.isArrowFunction(func)) {
            let parent = func.parent;
            if (ts.isParenthesizedExpression(parent)) {
                parent = parent.parent;
            }
            if (
                ts.isVariableDeclaration(parent) ||
                ts.isPropertyAssignment(parent) ||
                ts.isPropertyDeclaration(parent)
            ) {
                nameText = getNameText(parent.name, func) || nameText;
            } else if (
                ts.isBinaryExpression(parent) &&
                parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
            ) {
                if (
                    ts.isPropertyAccessExpression(parent.left) ||
                    ts.isElementAccessExpression(parent.left)
                ) {
                    nameText = getLeftHandSideName(parent.left);
                }
            }
        }
    }
    return nameText;
}

function getLeftHandSideName(left: ts.Expression): string {
    if (
        ts.isIdentifier(left) ||
        ts.isStringLiteral(left) ||
        ts.isNumericLiteral(left)
    ) {
        return left.text;
    } else if (ts.isPropertyAccessExpression(left)) {
        return getLeftHandSideName(left.expression) + "." + left.name.text;
    } else if (ts.isElementAccessExpression(left)) {
        return (
            getLeftHandSideName(left.expression) +
            "." +
            computedName(left.argumentExpression)
        );
    }
    return "<computed>";
}

function getNameText(
    name: ts.Node,
    func: ts.FunctionLikeDeclaration
): string | null {
    let nameText = null;
    if (
        ts.isIdentifier(name) ||
        ts.isStringLiteral(name) ||
        ts.isNumericLiteral(name)
    ) {
        nameText = name.text;
        if (ts.isGetAccessor(func)) {
            nameText = `get ${nameText}`;
        } else if (ts.isSetAccessor(func)) {
            nameText = `set ${nameText}`;
        }
    } else if (ts.isComputedPropertyName(name)) {
        nameText = computedName(name.expression);
    }
    return nameText;
}

function computedName(expression: ts.Expression) {
    if (ts.isIdentifier(expression)) {
        return `<computed: ${expression.text}>`;
    } else if (
        ts.isStringLiteral(expression) ||
        ts.isNumericLiteral(expression)
    ) {
        return expression.text;
    }
    return "<computed>";
}
