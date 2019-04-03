<img src="assets/pasta_128.png" align="right"/>

# @bloomberg/pasta-sourcemaps

[![npm Badge](https://img.shields.io/npm/v/@bloomberg/pasta-sourcemaps.svg)](https://www.npmjs.com/package/@bloomberg/pasta-sourcemaps)
[![Build Status](https://travis-ci.com/bloomberg/pasta-sourcemaps.svg?branch=master)](https://travis-ci.com/bloomberg/pasta-sourcemaps)

`pasta`, or Pretty (and) Accurate Stack Trace Analysis, is an implementation of an extension to the source map format that allows for accurate function name decoding. It allows you to extract function-related metadata from a source file and encode it into a source map, as well as decode a pasta-enriched source map to query enclosing function names for a given location. 

## Background

Source code often gets modified one way or another before hitting production - through transpilation, minification, etc. Looking at a "raw" crash stack of generated code can be hard work.

```javascript
// sample.js
const penne     = () => { throw Error(); }
const spaghetti = () => penne();
const orzo      = () => spaghetti();
orzo();
```

```javascript
// **original** output                           // **compiled** output
Error                                            Error
    at penne (sample.js:2:33)                        at r (out.js:1:82)
    at spaghetti (sample.js:3:25)         vs         at o (out.js:1:97)
    at orzo (sample.js:4:25)                         at n (out.js:1:107)
```

Today, [source maps](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k/edit?hl=en_US&pli=1&pli=1)
already provide the ability to produce accurate _locations_ (filename, line number, column number) in a crash stack, but not _enclosing
function names_. This hinders debugging and confuses automatic crash stack consolidation.

`pasta` extends the source map format with a `x_com_bloomberg_sourcesFunctionMappings` field to allow for accurate function name decoding. See [spec.md](spec.md) to learn more about the `pasta` format. 

## Features

- Native support for ECMAScript, TypeScript, JSX and TSX input source types
- Encoder allows you to roll your own parser to support other languages

## Installation

```bash
npm install @bloomberg/pasta-sourcemaps
```

## API

`@bloomberg/pasta-sourcemaps` exposes three utilities:
- [parser](src/parser.ts)
- [encoder](src/encoder.ts)
- [decoder](src/decoder.ts)

The parser and the encoder are normally used in conjuction to parse a source file and encode the resulting function descriptions into a source map. 

The decoder takes a pasta-enriched sourcemap and gives back enclosing function names for a given source file, line and column location. 

To read the full API documentation please visit the [GitHub Pages](https://bloomberg.github.io/pasta-sourcemaps/)

## Usage

### Parser

```javascript
const pasta = require("@bloomberg/pasta-sourcemaps");

const source = "function orzo(){}; function penne(){};";
const functionDescs = pasta.parse(source, "ECMAScript");

console.log(functionDescs);
```

output

```javascript
[
    {
        name: '<top-level>',
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 38 
    },
    {
        name: 'orzo',
        startLine: 0,
        startColumn: 0,
        endLine: 0,
        endColumn: 17 
    },
    {
        name: 'penne',
        startLine: 0,
        startColumn: 18,
        endLine: 0,
        endColumn: 37 
    } 
]
```

### Encoder

```javascript
const pasta = require("@bloomberg/pasta-sourcemaps");

const sourceMap = {
    version: 3,
    file: 'out.js',
    sources: [ 'barilla.js' ],
    names: [ 'orzo', 'penne' ],
    mappings: 'AAAA,SAASA,QAAU,SAASC'
};

const functionDescs = new Map([
    [
        "barilla.js", [
        {
            name: '<top-level>',
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 38 
        },
        {
            name: 'orzo',
            startLine: 0,
            startColumn: 0,
            endLine: 0,
            endColumn: 17 
        },
        {
            name: 'penne',
            startLine: 0,
            startColumn: 18,
            endLine: 0,
            endColumn: 37 
        } 
        ]
    ]
]);

const enrichedSourceMap = pasta.encode(sourceMap, functionDescs);

console.log(enrichedSourceMap);
```

output

```javascript
{
    version: 3,
    file: 'out.js',
    sources: [ 'barilla.js' ],
    names: [ 'orzo', 'penne', '<top-level>' ],
    mappings: 'AAAA,SAASA,QAAU,SAASC',
    x_com_bloomberg_sourcesFunctionMappings: [ 'EAAAsC,FAAArB,CAkBAoB' ] 
}
```

### Decoder

```javascript
const pasta = require("@bloomberg/pasta-sourcemaps");

const enrichedSourceMap = {
    version: 3,
    file: 'out.js',
    sources: [ 'barilla.js' ],
    names: [ 'orzo', 'penne', '<top-level>' ],
    mappings: 'AAAA,SAASA,QAAU,SAASC',
    x_com_bloomberg_sourcesFunctionMappings: [ 'EAAAsC,FAAArB,CAkBAoB' ] 
};

const decoder = new pasta.SourceMapDecoder(enrichedSourceMap);

decoder.decode("barilla.js", 0, 4);  // orzo
decoder.decode("barilla.js", 0, 25); // penne
```

## License

[Apache 2.0](LICENSE)
