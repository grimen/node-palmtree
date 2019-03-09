# `node-palmtree` [![NPM version](https://badge.fury.io/js/%40grimen%2Fpalmtree.svg)](https://badge.fury.io/js/%40grimen%2Fpalmtree) [![Build Status](https://travis-ci.com/grimen/node-palmtree.svg?token=sspjPRWbecBSpceU8Jyn&branch=master)](https://travis-ci.com/grimen/node-palmtree) [![Coverage Status](https://codecov.io/gh/grimen/node-palmtree/branch/master/graph/badge.svg)](https://codecov.io/gh/grimen/node-palmtree)

*A pretty filesystem tree inspection utility - for Node.js.*

![Screenshot](https://dvfr2lc5dhzsq.cloudfront.net/items/1x2l3v3p3f1o3R1b203H/Screen%20Shot%202019-03-07%20at%2004.07.33.png?X-CloudApp-Visitor-Id=c6ecab27bd8bc8eb8c40bf7dc50cef57)


## Introduction

TODO


## Install

Install using **npm**:

```bash
$ npm install @grimen/palmtree
```

Install using **yarn**:

```bash
$ yarn add @grimen/palmtree
```


# Use

Very basic **[example](https://github.com/grimen/node-palmtree/tree/master/examples/basic.js)**:

```javascript
const palmtree = require('@grimen/palmtree')

const util = require('util')
const color = require('chalk')
const fs = require('fs')

/* =======================================================
    EXAMPLE: log plain colorized output
----------------------------------------------------- */

console.log(`[log/plain]: plain colorized output`)

await palmtree.log('./test/__fixtures__/foo')

/* =======================================================
    EXAMPLE: log detailed custom colorized output
----------------------------------------------------- */

console.log(`[log/detailed]: detailed custom colorized output`)

const meta = async (item) => {
    try {
        const stat = await util.promisify(fs.stat)(item.resolvedPath)

        let data

        if (item.isFile) {
            data = await util.promisify(fs.readFile)(item.resolvedPath, 'utf8')
        }

        return [
            color.gray('- '),
            [
                color.bgMagenta(` ${stat.size} bytes `),
                data && JSON.stringify({data}),
                color.cyan(`${stat.ctime}`),
            ].join(color.gray(' ')),
        ].join('')

    } catch (error) {
        return color.yellow(`(!) could not read/resolve`)
    }
}

await palmtree.log('./test/__fixtures__/foo', {meta})

/* =======================================================
    EXAMPLE: inspect plain output
----------------------------------------------------- */

console.log(`[inspect/plain]: inspect plain colorized output`)

let inspection = await palmtree.inspect('./test/__fixtures__/foo')

console.log('[inspect/plain]:', inspection)

/* =======================================================
    EXAMPLE: inspect detailed custom output
----------------------------------------------------- */

console.log(`[inspect/detailed]: inspect detailed custom colorized output`)

inspection = await palmtree.inspect('./test/__fixtures__/foo', {meta})

console.log('[inspect/detailed]:', inspection)

/* =======================================================
    EXAMPLE: get plain object
----------------------------------------------------- */

console.log(`[get/plain]: get plain object`)

let tree = await palmtree.get('./test/__fixtures__/foo')

console.log('[get/plain]:', util.inspect(tree, {depth: null, compact: false}))

/* =======================================================
    EXAMPLE: get detailed object
----------------------------------------------------- */

console.log(`[get/detailed]: get detailed object`)

tree = await palmtree.get('./test/__fixtures__/foo', {meta})

console.log('[get/detailed]:', util.inspect(tree, {depth: null, compact: false}))
```

**Output:**

```sh
[log/plain]: plain colorized output

./test/__fixtures__/foo
├── bar
    ├── bar_1.txt
    ├── bar_2.txt
    └── baz
        ├── baz_1.txt
        └── baz_2.txt
├── baz  ⟶   ../bar/baz
├── baz_1.txt  ⟶   ../bar/baz/baz_1.txt
├── foo_1.txt
├── foo_2.txt
├── xxx  ⟶   ?
└── xxx.txt  ⟶   ?

[log/detailed]: detailed custom colorized output

./test/__fixtures__/foo
├── bar -  160 bytes   Sat Mar 02 2019 02:14:58 GMT-0500 (Eastern Standard Time)
    ├── bar_1.txt -  6 bytes  {"data":"bar_1\n"} Thu Mar 07 2019 00:55:19 GMT-0500 (Eastern Standard Time)
    ├── bar_2.txt -  6 bytes  {"data":"bar_2\n"} Thu Mar 07 2019 00:55:23 GMT-0500 (Eastern Standard Time)
    └── baz -  128 bytes   Tue Mar 05 2019 20:47:22 GMT-0500 (Eastern Standard Time)
        ├── baz_1.txt -  6 bytes  {"data":"baz_1\n"} Thu Mar 07 2019 00:55:28 GMT-0500 (Eastern Standard Time)
        └── baz_2.txt -  6 bytes  {"data":"baz_2\n"} Thu Mar 07 2019 00:55:33 GMT-0500 (Eastern Standard Time)
├── baz  ⟶   ../bar/baz -  128 bytes   Tue Mar 05 2019 20:47:22 GMT-0500 (Eastern Standard Time)
├── baz_1.txt  ⟶   ../bar/baz/baz_1.txt -  6 bytes  {"data":"baz_1\n"} Thu Mar 07 2019 00:55:28 GMT-0500 (Eastern Standard Time)
├── foo_1.txt -  6 bytes  {"data":"foo_1\n"} Thu Mar 07 2019 00:55:40 GMT-0500 (Eastern Standard Time)
├── foo_2.txt -  6 bytes  {"data":"foo_2\n"} Thu Mar 07 2019 00:55:44 GMT-0500 (Eastern Standard Time)
├── xxx  ⟶   ? (!) could not read/resolve
└── xxx.txt  ⟶   ? (!) could not read/resolve

[inspect/plain]: inspect plain colorized output
[inspect/plain]:
./test/__fixtures__/foo
├── bar
    ├── bar_1.txt
    ├── bar_2.txt
    └── baz
        ├── baz_1.txt
        └── baz_2.txt
├── baz  ⟶   ../bar/baz
├── baz_1.txt  ⟶   ../bar/baz/baz_1.txt
├── foo_1.txt
├── foo_2.txt
├── xxx  ⟶   ?
└── xxx.txt  ⟶   ?


[inspect/detailed]: inspect detailed custom colorized output
[inspect/detailed]:
./test/__fixtures__/foo
├── bar -  160 bytes   Sat Mar 02 2019 02:14:58 GMT-0500 (Eastern Standard Time)
    ├── bar_1.txt -  6 bytes  {"data":"bar_1\n"} Thu Mar 07 2019 00:55:19 GMT-0500 (Eastern Standard Time)
    ├── bar_2.txt -  6 bytes  {"data":"bar_2\n"} Thu Mar 07 2019 00:55:23 GMT-0500 (Eastern Standard Time)
    └── baz -  128 bytes   Tue Mar 05 2019 20:47:22 GMT-0500 (Eastern Standard Time)
        ├── baz_1.txt -  6 bytes  {"data":"baz_1\n"} Thu Mar 07 2019 00:55:28 GMT-0500 (Eastern Standard Time)
        └── baz_2.txt -  6 bytes  {"data":"baz_2\n"} Thu Mar 07 2019 00:55:33 GMT-0500 (Eastern Standard Time)
├── baz  ⟶   ../bar/baz -  128 bytes   Tue Mar 05 2019 20:47:22 GMT-0500 (Eastern Standard Time)
├── baz_1.txt  ⟶   ../bar/baz/baz_1.txt -  6 bytes  {"data":"baz_1\n"} Thu Mar 07 2019 00:55:28 GMT-0500 (Eastern Standard Time)
├── foo_1.txt -  6 bytes  {"data":"foo_1\n"} Thu Mar 07 2019 00:55:40 GMT-0500 (Eastern Standard Time)
├── foo_2.txt -  6 bytes  {"data":"foo_2\n"} Thu Mar 07 2019 00:55:44 GMT-0500 (Eastern Standard Time)
├── xxx  ⟶   ? (!) could not read/resolve
└── xxx.txt  ⟶   ? (!) could not read/resolve


[get/plain]: get plain object
[get/plain]: [
  {
    level: 0,
    path: 'test/__fixtures__/foo/bar',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar',
    relativePath: '.',
    name: 'bar',
    extension: null,
    key: 'bar',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar',
    resolvedRelativePath: '.',
    resolvedName: 'bar',
    resolvedExtension: null,
    resolvedKey: 'bar',
    isResolvedDirectory: true,
    isResolvedFile: false,
    isResolvedLink: false,
    isDirectory: true,
    isFile: false,
    isLink: false,
    isResolved: true,
    children: [
      {
        level: 1,
        path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        relativePath: '.',
        name: 'bar_1.txt',
        extension: '.txt',
        key: 'bar_1',
        resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        resolvedRelativePath: '.',
        resolvedName: 'bar_1.txt',
        resolvedExtension: '.txt',
        resolvedKey: 'bar_1',
        isResolvedDirectory: false,
        isResolvedFile: true,
        isResolvedLink: false,
        isDirectory: false,
        isFile: true,
        isLink: false,
        isResolved: true,
        children: null,
        meta: ''
      },
      {
        level: 1,
        path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        relativePath: '.',
        name: 'bar_2.txt',
        extension: '.txt',
        key: 'bar_2',
        resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        resolvedRelativePath: '.',
        resolvedName: 'bar_2.txt',
        resolvedExtension: '.txt',
        resolvedKey: 'bar_2',
        isResolvedDirectory: false,
        isResolvedFile: true,
        isResolvedLink: false,
        isDirectory: false,
        isFile: true,
        isLink: false,
        isResolved: true,
        children: null,
        meta: ''
      },
      {
        level: 1,
        path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        relativePath: '.',
        name: 'baz',
        extension: null,
        key: 'baz',
        resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        resolvedRelativePath: '.',
        resolvedName: 'baz',
        resolvedExtension: null,
        resolvedKey: 'baz',
        isResolvedDirectory: true,
        isResolvedFile: false,
        isResolvedLink: false,
        isDirectory: true,
        isFile: false,
        isLink: false,
        isResolved: true,
        children: [
          {
            level: 2,
            path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            relativePath: '.',
            name: 'baz_1.txt',
            extension: '.txt',
            key: 'baz_1',
            resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            resolvedRelativePath: '.',
            resolvedName: 'baz_1.txt',
            resolvedExtension: '.txt',
            resolvedKey: 'baz_1',
            isResolvedDirectory: false,
            isResolvedFile: true,
            isResolvedLink: false,
            isDirectory: false,
            isFile: true,
            isLink: false,
            isResolved: true,
            children: null,
            meta: ''
          },
          {
            level: 2,
            path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            relativePath: '.',
            name: 'baz_2.txt',
            extension: '.txt',
            key: 'baz_2',
            resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            resolvedRelativePath: '.',
            resolvedName: 'baz_2.txt',
            resolvedExtension: '.txt',
            resolvedKey: 'baz_2',
            isResolvedDirectory: false,
            isResolvedFile: true,
            isResolvedLink: false,
            isDirectory: false,
            isFile: true,
            isLink: false,
            isResolved: true,
            children: null,
            meta: ''
          }
        ],
        meta: ''
      }
    ],
    meta: ''
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/baz',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/baz',
    relativePath: '.',
    name: 'baz',
    extension: null,
    key: 'baz',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
    resolvedRelativePath: '../bar/baz',
    resolvedName: 'baz',
    resolvedExtension: null,
    resolvedKey: 'baz',
    isResolvedDirectory: true,
    isResolvedFile: false,
    isResolvedLink: false,
    isDirectory: true,
    isFile: false,
    isLink: true,
    isResolved: true,
    children: null,
    meta: ''
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/baz_1.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/baz_1.txt',
    relativePath: '.',
    name: 'baz_1.txt',
    extension: '.txt',
    key: 'baz_1',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
    resolvedRelativePath: '../bar/baz/baz_1.txt',
    resolvedName: 'baz_1.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'baz_1',
    isResolvedDirectory: false,
    isResolvedFile: true,
    isResolvedLink: false,
    isDirectory: false,
    isFile: true,
    isLink: true,
    isResolved: true,
    children: null,
    meta: ''
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/foo_1.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_1.txt',
    relativePath: '.',
    name: 'foo_1.txt',
    extension: '.txt',
    key: 'foo_1',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_1.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_1.txt',
    resolvedRelativePath: '.',
    resolvedName: 'foo_1.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'foo_1',
    isResolvedDirectory: false,
    isResolvedFile: true,
    isResolvedLink: false,
    isDirectory: false,
    isFile: true,
    isLink: false,
    isResolved: true,
    children: null,
    meta: ''
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/foo_2.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_2.txt',
    relativePath: '.',
    name: 'foo_2.txt',
    extension: '.txt',
    key: 'foo_2',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_2.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_2.txt',
    resolvedRelativePath: '.',
    resolvedName: 'foo_2.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'foo_2',
    isResolvedDirectory: false,
    isResolvedFile: true,
    isResolvedLink: false,
    isDirectory: false,
    isFile: true,
    isLink: false,
    isResolved: true,
    children: null,
    meta: ''
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/xxx',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx',
    relativePath: '.',
    name: 'xxx',
    extension: null,
    key: 'xxx',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx',
    resolvedRelativePath: '.',
    resolvedName: 'xxx',
    resolvedExtension: null,
    resolvedKey: 'xxx',
    isResolvedDirectory: false,
    isResolvedFile: false,
    isResolvedLink: true,
    isDirectory: false,
    isFile: false,
    isLink: true,
    isResolved: false,
    children: null,
    meta: ''
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/xxx.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx.txt',
    relativePath: '.',
    name: 'xxx.txt',
    extension: '.txt',
    key: 'xxx',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx.txt',
    resolvedRelativePath: '.',
    resolvedName: 'xxx.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'xxx',
    isResolvedDirectory: false,
    isResolvedFile: false,
    isResolvedLink: true,
    isDirectory: false,
    isFile: false,
    isLink: true,
    isResolved: false,
    children: null,
    meta: ''
  }
]
[get/detailed]: get detailed object
[get/detailed]: [
  {
    level: 0,
    path: 'test/__fixtures__/foo/bar',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar',
    relativePath: '.',
    name: 'bar',
    extension: null,
    key: 'bar',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar',
    resolvedRelativePath: '.',
    resolvedName: 'bar',
    resolvedExtension: null,
    resolvedKey: 'bar',
    isResolvedDirectory: true,
    isResolvedFile: false,
    isResolvedLink: false,
    isDirectory: true,
    isFile: false,
    isLink: false,
    isResolved: true,
    children: [
      {
        level: 1,
        path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        relativePath: '.',
        name: 'bar_1.txt',
        extension: '.txt',
        key: 'bar_1',
        resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_1.txt',
        resolvedRelativePath: '.',
        resolvedName: 'bar_1.txt',
        resolvedExtension: '.txt',
        resolvedKey: 'bar_1',
        isResolvedDirectory: false,
        isResolvedFile: true,
        isResolvedLink: false,
        isDirectory: false,
        isFile: true,
        isLink: false,
        isResolved: true,
        children: null,
        meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
          '\u001b[39m{"data":"bar_1\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
          '07 2019 00:55:19 GMT-0500 (Eastern Standard ' +
          'Time)\u001b[39m'
      },
      {
        level: 1,
        path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        relativePath: '.',
        name: 'bar_2.txt',
        extension: '.txt',
        key: 'bar_2',
        resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/bar_2.txt',
        resolvedRelativePath: '.',
        resolvedName: 'bar_2.txt',
        resolvedExtension: '.txt',
        resolvedKey: 'bar_2',
        isResolvedDirectory: false,
        isResolvedFile: true,
        isResolvedLink: false,
        isDirectory: false,
        isFile: true,
        isLink: false,
        isResolved: true,
        children: null,
        meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
          '\u001b[39m{"data":"bar_2\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
          '07 2019 00:55:23 GMT-0500 (Eastern Standard ' +
          'Time)\u001b[39m'
      },
      {
        level: 1,
        path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        relativePath: '.',
        name: 'baz',
        extension: null,
        key: 'baz',
        resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
        resolvedRelativePath: '.',
        resolvedName: 'baz',
        resolvedExtension: null,
        resolvedKey: 'baz',
        isResolvedDirectory: true,
        isResolvedFile: false,
        isResolvedLink: false,
        isDirectory: true,
        isFile: false,
        isLink: false,
        isResolved: true,
        children: [
          {
            level: 2,
            path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            relativePath: '.',
            name: 'baz_1.txt',
            extension: '.txt',
            key: 'baz_1',
            resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
            resolvedRelativePath: '.',
            resolvedName: 'baz_1.txt',
            resolvedExtension: '.txt',
            resolvedKey: 'baz_1',
            isResolvedDirectory: false,
            isResolvedFile: true,
            isResolvedLink: false,
            isDirectory: false,
            isFile: true,
            isLink: false,
            isResolved: true,
            children: null,
            meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
              '\u001b[39m{"data":"baz_1\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
              '07 2019 00:55:28 GMT-0500 (Eastern Standard ' +
              'Time)\u001b[39m'
          },
          {
            level: 2,
            path: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            relativePath: '.',
            name: 'baz_2.txt',
            extension: '.txt',
            key: 'baz_2',
            resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_2.txt',
            resolvedRelativePath: '.',
            resolvedName: 'baz_2.txt',
            resolvedExtension: '.txt',
            resolvedKey: 'baz_2',
            isResolvedDirectory: false,
            isResolvedFile: true,
            isResolvedLink: false,
            isDirectory: false,
            isFile: true,
            isLink: false,
            isResolved: true,
            children: null,
            meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
              '\u001b[39m{"data":"baz_2\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
              '07 2019 00:55:33 GMT-0500 (Eastern Standard ' +
              'Time)\u001b[39m'
          }
        ],
        meta: '\u001b[90m- \u001b[39m\u001b[45m 128 bytes \u001b[49m\u001b[90m ' +
          '\u001b[39m\u001b[90m \u001b[39m\u001b[36mTue Mar 05 2019 ' +
          '20:47:22 GMT-0500 (Eastern Standard ' +
          'Time)\u001b[39m'
      }
    ],
    meta: '\u001b[90m- \u001b[39m\u001b[45m 160 bytes \u001b[49m\u001b[90m ' +
      '\u001b[39m\u001b[90m \u001b[39m\u001b[36mSat Mar 02 2019 ' +
      '02:14:58 GMT-0500 (Eastern Standard ' +
      'Time)\u001b[39m'
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/baz',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/baz',
    relativePath: '.',
    name: 'baz',
    extension: null,
    key: 'baz',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz',
    resolvedRelativePath: '../bar/baz',
    resolvedName: 'baz',
    resolvedExtension: null,
    resolvedKey: 'baz',
    isResolvedDirectory: true,
    isResolvedFile: false,
    isResolvedLink: false,
    isDirectory: true,
    isFile: false,
    isLink: true,
    isResolved: true,
    children: null,
    meta: '\u001b[90m- \u001b[39m\u001b[45m 128 bytes \u001b[49m\u001b[90m ' +
      '\u001b[39m\u001b[90m \u001b[39m\u001b[36mTue Mar 05 2019 ' +
      '20:47:22 GMT-0500 (Eastern Standard ' +
      'Time)\u001b[39m'
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/baz_1.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/baz_1.txt',
    relativePath: '.',
    name: 'baz_1.txt',
    extension: '.txt',
    key: 'baz_1',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/bar/baz/baz_1.txt',
    resolvedRelativePath: '../bar/baz/baz_1.txt',
    resolvedName: 'baz_1.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'baz_1',
    isResolvedDirectory: false,
    isResolvedFile: true,
    isResolvedLink: false,
    isDirectory: false,
    isFile: true,
    isLink: true,
    isResolved: true,
    children: null,
    meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
      '\u001b[39m{"data":"baz_1\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
      '07 2019 00:55:28 GMT-0500 (Eastern Standard ' +
      'Time)\u001b[39m'
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/foo_1.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_1.txt',
    relativePath: '.',
    name: 'foo_1.txt',
    extension: '.txt',
    key: 'foo_1',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_1.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_1.txt',
    resolvedRelativePath: '.',
    resolvedName: 'foo_1.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'foo_1',
    isResolvedDirectory: false,
    isResolvedFile: true,
    isResolvedLink: false,
    isDirectory: false,
    isFile: true,
    isLink: false,
    isResolved: true,
    children: null,
    meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
      '\u001b[39m{"data":"foo_1\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
      '07 2019 00:55:40 GMT-0500 (Eastern Standard ' +
      'Time)\u001b[39m'
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/foo_2.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_2.txt',
    relativePath: '.',
    name: 'foo_2.txt',
    extension: '.txt',
    key: 'foo_2',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_2.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/foo_2.txt',
    resolvedRelativePath: '.',
    resolvedName: 'foo_2.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'foo_2',
    isResolvedDirectory: false,
    isResolvedFile: true,
    isResolvedLink: false,
    isDirectory: false,
    isFile: true,
    isLink: false,
    isResolved: true,
    children: null,
    meta: '\u001b[90m- \u001b[39m\u001b[45m 6 bytes \u001b[49m\u001b[90m ' +
      '\u001b[39m{"data":"foo_2\\n"}\u001b[90m \u001b[39m\u001b[36mThu Mar ' +
      '07 2019 00:55:44 GMT-0500 (Eastern Standard ' +
      'Time)\u001b[39m'
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/xxx',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx',
    relativePath: '.',
    name: 'xxx',
    extension: null,
    key: 'xxx',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx',
    resolvedRelativePath: '.',
    resolvedName: 'xxx',
    resolvedExtension: null,
    resolvedKey: 'xxx',
    isResolvedDirectory: false,
    isResolvedFile: false,
    isResolvedLink: true,
    isDirectory: false,
    isFile: false,
    isLink: true,
    isResolved: false,
    children: null,
    meta: '\u001b[33m(!) could not read/resolve\u001b[39m'
  },
  {
    level: 0,
    path: 'test/__fixtures__/foo/xxx.txt',
    absolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx.txt',
    relativePath: '.',
    name: 'xxx.txt',
    extension: '.txt',
    key: 'xxx',
    resolvedPath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx.txt',
    resolvedAbsolutePath: '/Users/grimen/Dev/Private/node-palmtree/test/__fixtures__/foo/xxx.txt',
    resolvedRelativePath: '.',
    resolvedName: 'xxx.txt',
    resolvedExtension: '.txt',
    resolvedKey: 'xxx',
    isResolvedDirectory: false,
    isResolvedFile: false,
    isResolvedLink: true,
    isDirectory: false,
    isFile: false,
    isLink: true,
    isResolved: false,
    children: null,
    meta: '\u001b[33m(!) could not read/resolve\u001b[39m'
  }
]
```

## Test

Clone down source code:

```sh
$ make install
```

Run **colorful tests** using **jest**:

```sh
$ make test
```

## Related

- [**`python-palmtree`**](https://github.com/grimen/python-palmtree) - *"A pretty filesystem tree inspection utility - for Python"*


## About

This project was mainly initiated - in lack of solid existing alternatives - to be used at our work at **[Markable.ai](https://markable.ai)** to have common code conventions between various programming environments where **Node.js** (for I/O heavy operations) is heavily used.


## License

Released under the MIT license.
