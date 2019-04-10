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

import * as assert from "assert";
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
        // set the name to "", the class name will be added later
        nameText = "";
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
    const prefix = getPrefix(func);
    if (prefix) {
        return nameText === "" ? prefix : `${prefix}.${nameText}`;
    }
    return nameText;
}

function getPrefix(func: ts.FunctionLikeDeclaration): string | null {
    let propValue: ts.FunctionLikeDeclaration | ts.ClassLikeDeclaration = func;
    let prefix = null;
    // get class prefix if function is inside a class
    const classPrefix = getClassPrefix(func);
    if (classPrefix) {
        prefix = classPrefix;
        const classPropValue = getParentClassProperty(func);
        if (classPropValue) {
            // if the class is a property of an object literal, we want to
            // walk the object literal chain of the class instead of the function
            propValue = classPropValue;
        } else {
            // this means the class is not inside an object literal and we are done
            return prefix;
        }
    }

    // get object literal prefix if function (or enclosing class)
    // is inside an object literal
    const objectLiteralPrefix = getObjectLiteralPrefix(propValue);
    if (objectLiteralPrefix) {
        prefix = prefix
            ? `${objectLiteralPrefix}.${prefix}`
            : objectLiteralPrefix;
    }
    return prefix;
}

function isProperty(
    func: ts.FunctionLikeDeclaration | ts.ClassLikeDeclaration
) {
    return (
        (ts.isFunctionExpression(func) ||
            ts.isArrowFunction(func) ||
            ts.isClassExpression(func)) &&
        (ts.isPropertyDeclaration(func.parent) ||
            ts.isPropertyAssignment(func.parent))
    );
}

function getPropertyNodeForFunction(
    func: ts.FunctionLikeDeclaration | ts.ClassLikeDeclaration
) {
    let propertyNode;
    if (
        ts.isMethodDeclaration(func) ||
        ts.isGetAccessor(func) ||
        ts.isSetAccessor(func) ||
        ts.isConstructorDeclaration(func)
    ) {
        propertyNode = func;
    } else if (
        ts.isFunctionExpression(func) ||
        ts.isArrowFunction(func) ||
        ts.isClassExpression(func)
    ) {
        if (
            ts.isPropertyDeclaration(func.parent) ||
            ts.isPropertyAssignment(func.parent)
        ) {
            propertyNode = func.parent;
        }
    }
    return propertyNode;
}

function getObjectLiteralPrefix(
    func: ts.FunctionLikeDeclaration | ts.ClassLikeDeclaration
): string | null {
    const isProp = isProperty(func);
    const propertyNode = getPropertyNodeForFunction(func);
    // propertyNode === null means the function was neither a method nor a
    // property, so it is not part of an object literal or class declaration
    if (!propertyNode) {
        return null;
    }
    // if the function is a property, and either has a local name,
    // or is inside a class expression, we take the local name and
    // and do not prefix it with the object literal chain
    if (isProp) {
        if (
            func.name !== undefined ||
            ts.isClassExpression(propertyNode.parent)
        ) {
            return null;
        }
    }
    return getObjectLiteralPrefixR(propertyNode.parent);
}

function getObjectLiteralPrefixR(
    node: ts.Node,
    prefixWithObject = false
): string | null {
    const parent = node.parent;
    if (!parent) {
        return null;
    }
    if (ts.isPropertyAssignment(parent)) {
        const propertyAssignment = parent;
        const prefix = getObjectLiteralPrefixR(
            propertyAssignment.parent,
            true
        );
        return `${prefix}.${getPropertyName(propertyAssignment.name)}`;
    } else if (ts.isVariableDeclaration(parent)) {
        if (ts.isIdentifier(parent.name)) {
            return getPropertyName(parent.name);
        }
    } else if (
        ts.isBinaryExpression(parent) &&
        parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
    ) {
        if (ts.isIdentifier(parent.left)) {
            return getPropertyName(parent.left);
        } else if (
            ts.isPropertyAccessExpression(parent.left) ||
            ts.isElementAccessExpression(parent.left)
        ) {
            return getLeftHandSideName(parent.left);
        }
    }
    return prefixWithObject ? "<Object>" : null;
}

function getParentClassProperty(func: ts.FunctionLikeDeclaration) {
    const propertyNode = getPropertyNodeForFunction(func);
    if (propertyNode) {
        const parent = propertyNode.parent;
        if (ts.isClassDeclaration(parent) || ts.isClassExpression(parent)) {
            return parent;
        }
    }
    return null;
}

function getClassPrefix(func: ts.FunctionLikeDeclaration): string | null {
    const isProp = isProperty(func);
    const propertyNode = getPropertyNodeForFunction(func);
    if (!propertyNode) {
        return null;
    }
    const parent = propertyNode.parent;
    if (ts.isClassDeclaration(parent) || ts.isClassExpression(parent)) {
        const className = getClassName(parent);
        if (isStatic(propertyNode)) {
            if (!isProp || func.name === undefined) {
                return className;
            }
        } else if (ts.isConstructorDeclaration(func)) {
            return className;
        } else if (!isProp) {
            return `${className}.prototype`;
        }
    }
    return null;
}

function getClassName(classNode: ts.ClassLikeDeclaration): string {
    // if class has a local name, use it and return,
    // not interested in left hand side
    if (classNode.name) {
        return classNode.name.text;
    }
    // try to get the name from the left hand side
    if (ts.isClassExpression(classNode)) {
        const parent = classNode.parent;
        if (
            ts.isVariableDeclaration(parent) ||
            ts.isPropertyAssignment(parent) ||
            ts.isPropertyDeclaration(parent)
        ) {
            if (ts.isPropertyName(parent.name)) {
                return getPropertyName(parent.name);
            }
        } else if (
            ts.isBinaryExpression(parent) &&
            parent.operatorToken.kind === ts.SyntaxKind.EqualsToken
        ) {
            if (
                ts.isPropertyAccessExpression(parent.left) ||
                ts.isElementAccessExpression(parent.left)
            ) {
                return getLeftHandSideName(parent.left);
            }
        }
    }
    return "<anonymous>";
}

function isStatic(func: ts.Node): boolean {
    if (func.modifiers) {
        return func.modifiers.some(({ kind }) => {
            return kind === ts.SyntaxKind.StaticKeyword;
        });
    }
    return false;
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

function getPropertyName(name: ts.PropertyName): string {
    if (
        ts.isIdentifier(name) ||
        ts.isStringLiteral(name) ||
        ts.isNumericLiteral(name)
    ) {
        return name.text;
    }
    if (ts.isComputedPropertyName(name)) {
        return computedName(name.expression);
    }
    // all cases are covered above, should never reach here
    assert(false);
    return "";
}

function getNameText(
    name: ts.Node,
    func: ts.FunctionLikeDeclaration
): string | null {
    let nameText = null;
    if (ts.isPropertyName(name)) {
        nameText = getPropertyName(name);
        if (ts.isGetAccessor(func)) {
            return `get ${nameText}`;
        }
        if (ts.isSetAccessor(func)) {
            return `set ${nameText}`;
        }
    }
    return nameText;
}

function computedName(expression: ts.Expression): string {
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
