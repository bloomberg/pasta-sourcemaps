# pasta, Pretty (and) Accurate Stack Trace Analysis

`pasta` extends the source map format with a `x_com_bloomberg_sourcesFunctionMappings` field to allow for accurate function name decoding. 

## Problem Statement

Source code often gets modified one way or another before hitting production - through transpilation, minification, etc. 
Looking at a "raw" crash stack of generated code can be hard work. Here's a comparison of crash stacks for a sample file. 

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
already provide the ability to produce accurate *locations* (filename, line number, column number) in a crash stack, but not *enclosing
function names*. This hinders debugging and confuses automatic crash stack consolidation.

## Proposed Solution

Extra information is added into the source maps to allow immediate decoding of the name of the enclosing function, without needing to consult any other files.

**Example**

```javascript
var a = 1;           // Name: "<top-level>"
function penne () {
  var b = 2;         // Name: "penne"
  (function () {
     var c = 3;      // Name: "<anonymous>"
  })();
  var d = 4;         // Name: "penne"
  return;            // Name: "penne"
}
penne();             // Name: "<top-level>"
```

### Proposed Source Map Extension: `x_com_bloomberg_sourcesFunctionMappings`

`x_com_bloomberg_sourcesFunctionMappings` is a new source map field that describes, for a given range in a source, the enclosing function's name.

This implies a two-phase decode.
First, the *source location* is decoded, the same way it is done today.
Second, the *function name* is decoded using the *source location*.

The existing `names` array is used to store function names.

**Example source map with extension**

```json5
{
    "file":"generated.js",
    "version":3,
    "sources": [
        "barilla.ts"
        "muellers.ts"],
    "names":[
        "define",
        "console",
        // **NEW** supplementary function names
        "penne",
        "fusilli"
    ],
    "mappings": "...",
    // **NEW** for each source, a list of mappings of function names
    "x_com_bloomberg_sourcesFunctionMappings": [
        "<function name mappings for sources[0]>",
        "<function name mappings for sources[1]>"
    ],
    "sourceRoot":"../../.."
}
```

#### Encoding

`"x_com_bloomberg_sourcesFunctionMappings"` is an optional list of **function mapping sequences** for each _source_.
The _function mapping sequences_ are listed in the same order as the `sources` property.
`null` may be used if there is no _function mapping sequence_ for a given _source_.

A _function mapping sequences_ is a comma-separated list of VLQ-encoded mappings for a single _source_.
Each mapping contains exactly five integer fields:

0. **functionName** is a zero-based index into the `names` array, relative to the previous mapping's _functionName_.
1. **startLine** is the zero-based starting line in the _source_, relative to the previous mapping's _endLine_.
2. **startColumn** is the zero-based starting column in the _source_, relative to the previous mapping's _startColumn_.
3. **endLine** is the zero-based ending line in the _source_, relative to _startLine_.
4. **endColumn** is the zero-based ending column in the _source_, relative to the previous mapping's _endColumn_.


The first mapping in a sequence is treated as having a *previous mapping* with all values set to zero.

Invariants:

- Mappings are stored in order such that the starting positions are always ascending; first by line, then by column.
- Mappings can fully overlap ("nesting") but will never partially overlap.

Notes:

- There is no guarantee that mappings will be provided for all positions in a _source_.  It may have gaps.
- Negative _startLine_ values imply nesting.
- Relative-positioning was chosen over absolute-positioning to reduce the file-size.

**Example Logical Encoding**

```json5
{
    "sources": [
        "barilla.ts"
        "muellers.ts"
    ],
    "names": [
        "penne",
        "fusilli",
        "orzo",
    ],
    "x_com_bloomberg_sourcesFunctionMappings": [
        [
            [0,0,19,6,0],  // barilla.ts (1:20)...(7:1)   => "penne"
            [1,-2,19,1,4]  // barilla.ts (5:39)...(6:5)   => "fusilli"
        ],
        [
            [2,0,10,0,79]  // muellers.ts (1:11)...(1,80) => "orzo"
        ]
    ]
}
```

**Example Physical Encoding**

```json5
{
    "sources": [
        "barilla.ts"
        "muellers.ts"
    ],
    "names": [
        "penne",
        "fusilli",
        "orzo",
    ],
    "x_com_bloomberg_sourcesFunctionMappings": [
        "AAmBMA,CFmBCI",
        "EAUA+E"
    ]
}
```

## References

### Specs

- [Source Map Revision 3 specification](https://docs.google.com/document/d/1U1RGAehQwRypUTovF1KRlpiOFze0b-_2gc6fAH0KY0k)
- [Proposal by Andy Sterland & Ron Buckton](https://gist.github.com/asterland/edf028ed7947c8c258d1) from 2014-09
  - [Related discussion](https://groups.google.com/d/msg/mozilla.dev.js-sourcemap/nB8f2sstwmU/38_z1M6DGOEJ)
  - Noted omission: Does not support decoding renamed object properties
- [Proposal by Nick Fitzgerald](https://github.com/fitzgen/source-map-rfc/blob/scopes-and-bindings/proposals/env.md) from 2015-07
  - [Related discussion](https://groups.google.com/d/msg/mozilla.dev.js-sourcemap/BT032gzqhZI/MQIVTFMoBgAJ)

### Tools

- Web App: [Source Map Visualizer](https://sokra.github.io/source-map-visualization/)
- Web App: [VLQ Encoder/Decoder](http://murzwin.com/base64vlq.html)
- NPM Package: [source-map encoder/decoder](https://github.com/mozilla/source-map)

### General

- [Mozilla Source Map Discussion Board](https://groups.google.com/forum/#!forum/mozilla.dev.js-sourcemap)
- [Stack Trace Analysis Tool (STAT)](https://github.com/LLNL/STAT)
  - Merges multiple stack traces from independent processes together and detects similiarities.
- [Sentry - Error Tracking Software](https://docs.sentry.io/data-management/rollups/?platform=javascript)
  - Discusses the aggregation ("grouping") abilities of the product, including the ability to read source maps.
