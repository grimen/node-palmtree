/* global jest describe test expect */

// =========================================
//       IMPORTS
// --------------------------------------

const palmtree = require('../src')

const path = require('path')
const fs = require('fs')
const util = require('util')
const chalk = require('chalk')
const md5 = require('md5')
const stripANSI = require('strip-ansi')


// =========================================
//       HELPERS
// --------------------------------------

const resolveFixtureDataPaths = (object) => {
    if (object && typeof object === 'object') {
        if (Array.isArray(object)) {
            return object.map(resolveFixtureDataPaths)
        }

        let mappedObject = {
            ...object,
        }

        const ENV_VARIABLE_PATTERN = /\$([a-zA-Z_][a-zA-Z0-9_]+)/g

        for (let [key, value] of Object.entries(object)) {
            if (value) {
                if (typeof value === 'string') {
                    value = value.replace(ENV_VARIABLE_PATTERN, (_, key) => {
                        return process.env[key] || `$${key}`
                    })

                } else if (typeof value === 'object') {
                    if (Array.isArray(value)) {
                        value = value.map(resolveFixtureDataPaths)

                    } else {
                        value = resolveFixtureDataPaths(value)
                    }
                }
            }

            mappedObject[key] = value
        }

        return mappedObject
    }

    return object
}

const mapFixtureTreeMetaFields = async (object, mapKey, mapper) => {
    if (object && typeof object === 'object') {
        if (Array.isArray(object)) {
            return await Promise.all(object.map((object) => {
                return mapFixtureTreeMetaFields(object, mapKey, mapper)
            }))
        }

        let mappedObject = {
            ...object,
        }

        for (let [key, value] of Object.entries(object)) {
            if (key === mapKey) {
                try {
                    value = await mapper(object)

                } catch (error) {
                    // skip
                }
            }

            if (value && typeof value === 'object') {
                if (Array.isArray(value)) {
                    value = await Promise.all(value.map((object) => {
                        return mapFixtureTreeMetaFields(object, mapKey, mapper)
                    }))

                } else {
                    value = mapFixtureTreeMetaFields(value, mapKey, mapper)
                }
            }

            mappedObject[key] = value
        }

        return mappedObject
    }

    return object
}


// =========================================
//       FIXTURES
// --------------------------------------

const FOO_GET_OBJECT = resolveFixtureDataPaths(require('./__fixtures__/get_foo.json'))

const VALID_FOLDER_PATH = path.resolve('./test/__fixtures__/foo')
const VALID_FILE_PATH = path.resolve('./test/__fixtures__/foo/foo_1.txt')

const INVALID_FOLDER_PATH = path.resolve('./test/__fixtures__/xxx')
const INVALID_FILE_PATH = path.resolve('./test/__fixtures__/xxx/foo_1.txt')


// =========================================
//       TESTS
// --------------------------------------

describe('palmtree', () => {

    test('import', () => {
        expect(palmtree).toBeInstanceOf(Object)
    })

    test('get', async () => {
        expect(palmtree.get).toBeInstanceOf(Function)

        const meta = async (item) => {
            try {
                return (await util.promisify(fs.readFile)(item.resolvedPath, 'utf8')).trim()

            } catch (error) {
                return ''
            }
        }

        expect(palmtree.get(VALID_FOLDER_PATH)).resolves.toEqual(FOO_GET_OBJECT)
        expect(palmtree.get(VALID_FILE_PATH)).rejects.toThrow()
        expect(palmtree.get(INVALID_FOLDER_PATH)).rejects.toThrow()
        expect(palmtree.get(INVALID_FILE_PATH)).rejects.toThrow()

        expect(palmtree.get(VALID_FOLDER_PATH, {silent: true})).resolves.toEqual(FOO_GET_OBJECT)
        expect(palmtree.get(VALID_FILE_PATH, {silent: true})).resolves.toEqual([])
        expect(palmtree.get(INVALID_FOLDER_PATH, {silent: true})).resolves.toEqual([])
        expect(palmtree.get(INVALID_FILE_PATH, {silent: true})).resolves.toEqual([])

        const MAPPED_FOO_GET_OBJECT = await mapFixtureTreeMetaFields(FOO_GET_OBJECT, 'meta', meta)

        expect(palmtree.get(VALID_FOLDER_PATH, {meta})).resolves.toEqual(MAPPED_FOO_GET_OBJECT)
        expect(palmtree.get(VALID_FILE_PATH, {meta})).rejects.toThrow()
        expect(palmtree.get(INVALID_FOLDER_PATH, {meta})).rejects.toThrow()
        expect(palmtree.get(INVALID_FILE_PATH, {meta})).rejects.toThrow()

        expect(palmtree.get(VALID_FOLDER_PATH, {meta, silent: true})).resolves.toEqual(MAPPED_FOO_GET_OBJECT)
        expect(palmtree.get(VALID_FILE_PATH, {meta, silent: true})).resolves.toEqual([])
        expect(palmtree.get(INVALID_FOLDER_PATH, {meta, silent: true})).resolves.toEqual([])
        expect(palmtree.get(INVALID_FILE_PATH, {meta, silent: true})).resolves.toEqual([])
    })

    test('inspect', async () => {
        expect(palmtree.inspect).toBeInstanceOf(Function)

        const meta = async (item) => {
            try {
                return (await util.promisify(fs.readFile)(item.resolvedPath, 'utf8')).trim()

            } catch (error) {
                return ''
            }
        }

        let result

        result = await palmtree.inspect(VALID_FOLDER_PATH)
        result = stripANSI(result)

        expect(result).toEqual(`\n${process.env.PWD}/test/__fixtures__/foo\n├── bar \n    ├── bar_1.txt \n    ├── bar_2.txt \n    └── baz \n        ├── baz_1.txt \n        └── baz_2.txt \n├── baz  ⟶   ../bar/baz \n├── baz_1.txt  ⟶   ../bar/baz/baz_1.txt \n├── foo_1.txt \n├── foo_2.txt \n├── xxx  ⟶   ? \n└── xxx.txt  ⟶   ? \n\n`)
        expect(palmtree.inspect(VALID_FILE_PATH)).rejects.toThrow()
        expect(palmtree.inspect(INVALID_FOLDER_PATH)).rejects.toThrow()
        expect(palmtree.inspect(INVALID_FILE_PATH)).rejects.toThrow()

        result = await palmtree.inspect(VALID_FOLDER_PATH, {silent: true})
        result = stripANSI(result)

        expect(result).toEqual(`\n${process.env.PWD}/test/__fixtures__/foo\n├── bar \n    ├── bar_1.txt \n    ├── bar_2.txt \n    └── baz \n        ├── baz_1.txt \n        └── baz_2.txt \n├── baz  ⟶   ../bar/baz \n├── baz_1.txt  ⟶   ../bar/baz/baz_1.txt \n├── foo_1.txt \n├── foo_2.txt \n├── xxx  ⟶   ? \n└── xxx.txt  ⟶   ? \n\n`)

        result = await palmtree.inspect(VALID_FILE_PATH, {silent: true})
        result = stripANSI(result)

        expect(result).toEqual(`\n${process.env.PWD}/test/__fixtures__/foo/foo_1.txt\n\n    Not a valid directory: ${process.env.PWD}/test/__fixtures__/foo/foo_1.txt\n\n`)

        result = await palmtree.inspect(INVALID_FOLDER_PATH, {silent: true})
        result = stripANSI(result)

        expect(result).toEqual(`\n${process.env.PWD}/test/__fixtures__/xxx\n\n    Not a valid file/directory: ${process.env.PWD}/test/__fixtures__/xxx\n\n`)

        result = await palmtree.inspect(INVALID_FILE_PATH, {silent: true})
        result = stripANSI(result)

        expect(result).toEqual(`\n${process.env.PWD}/test/__fixtures__/xxx/foo_1.txt\n\n    Not a valid file/directory: ${process.env.PWD}/test/__fixtures__/xxx/foo_1.txt\n\n`)
    })

    test('log', () => {
        expect(palmtree.log).toBeInstanceOf(Function)

        expect(palmtree.log(VALID_FOLDER_PATH)).resolves.toEqual(undefined)
        expect(palmtree.log(VALID_FILE_PATH)).resolves.toEqual(undefined)
        expect(palmtree.log(INVALID_FOLDER_PATH)).resolves.toEqual(undefined)
        expect(palmtree.log(INVALID_FILE_PATH)).resolves.toEqual(undefined)

        const meta = async (item) => {
            try {
                const stat = await util.promisify(fs.stat)(item.resolvedPath)

                let data

                if (item.isFile) {
                    data = await util.promisify(fs.readFile)(item.resolvedPath, 'utf8')
                }

                return [
                    chalk.gray('- '),
                    [
                        chalk.bgMagenta(` ${stat.size} bytes `),
                        data && JSON.stringify({data}),
                        chalk.cyan(`${stat.ctime}`),
                    ].join(chalk.gray(' ')),
                ].join('')

            } catch (error) {
                return chalk.yellow(`(!) could not read/resolve`)
            }
        }

        expect(palmtree.log(VALID_FOLDER_PATH, {meta})).resolves.toEqual(undefined)
        expect(palmtree.log(VALID_FILE_PATH, {meta})).resolves.toEqual(undefined)
        expect(palmtree.log(INVALID_FOLDER_PATH, {meta})).resolves.toEqual(undefined)
        expect(palmtree.log(INVALID_FILE_PATH, {meta})).resolves.toEqual(undefined)
    })

})
