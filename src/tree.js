
/* =========================================
      IMPORTS
-------------------------------------- */

const fs = require('fs')
const util = require('util')
const path = require('path')
const color = require('chalk')


/* =========================================
      PROMISIFY
-------------------------------------- */

fs.readdirAsync = util.promisify(fs.readdir)
fs.lstatAsync = util.promisify(fs.lstat)
fs.realpathAsync = util.promisify(fs.realpath)


/* =========================================
      CONSTANTS
-------------------------------------- */

const CURRENT_PATH = '.'
const ROOT_LEVEL = 0
const ENV_VARIABLE_PATTERN = /\$([a-zA-Z_][a-zA-Z0-9_]+)/g

const DEFAULT_SILENT = false
const DEFAULT_INDENT = 4

const SPACE = ' '

// const BRANCH_PREFIX = '│  '
const BRANCH_ITEM_PREFIX = '├── '
const BRANCH_ITEM_PREFIX_LAST = '└── '
const BRANCH_ITEM_LINK_SUFFIX = ' ⟶  '
const BRANCH_ITEM_LINK_BROKEN = '?'

/* =========================================
      FUNCTIONS
-------------------------------------- */

const getTree = async (rootPath = CURRENT_PATH, options = {}, level = ROOT_LEVEL) => {
    let {
        silent,
        meta,
    } = options || {}

    if (silent !== false) {
        silent = !!silent || DEFAULT_SILENT
    }

    const items = []

    try {
        rootPath = path.resolve(rootPath)

        let rootPathStat

        try {
            rootPathStat = await fs.lstatAsync(rootPath)

        } catch (error) {
            throw new Error(`Not a valid file/directory: ${rootPath}`)
        }

        if (!rootPathStat.isDirectory()) {
            throw new Error(`Not a valid directory: ${rootPath}`)
        }

        let fileNames

        try {
            fileNames = await fs.readdirAsync(rootPath)

        } catch (error) {
            throw new Error(`Could not read directory contents: ${rootPath}`)
        }

        for (let fileName of fileNames) {
            const filePath = path.join(rootPath, fileName)
            const relativeFilePath = '.'

            let absoluteFilePath

            absoluteFilePath = filePath.replace(ENV_VARIABLE_PATTERN, (_, key) => {
                return process.env[key]
            })
            absoluteFilePath = path.resolve(absoluteFilePath)

            let resolvedFilePath = `${absoluteFilePath}`
            let fileExtension = path.extname(fileName).trim()

            if (!fileExtension.length) {
                fileExtension = null
            }

            const fileKey = path.basename(fileName, fileExtension || '')

            let fileStat

            try {
                fileStat = await fs.lstatAsync(absoluteFilePath)
            } catch (error) {
                throw new Error(`File path don't exist: ${absoluteFilePath}`)
            }

            const isDirectory = fileStat && fileStat.isDirectory()
            const isFile = fileStat && fileStat.isFile()
            const isLink = fileStat && fileStat.isSymbolicLink()

            let isResolved = true

            if (isLink) {
                try {
                    resolvedFilePath = await fs.realpathAsync(resolvedFilePath)

                } catch (error) {
                    isResolved = false
                }
            }

            const resolvedAbsoluteFilePath = `${resolvedFilePath}`

            let resolvedRelativePath = '.'

            if (isLink) {
                resolvedRelativePath = path.relative(absoluteFilePath, resolvedAbsoluteFilePath)

                if (!resolvedRelativePath.length) {
                    resolvedRelativePath = '.'
                }
            }

            let resolvedFileExtension = path.extname(resolvedFilePath).trim()

            if (!resolvedFileExtension.length) {
                resolvedFileExtension = null
            }

            const resolvedFileName = path.basename(resolvedFilePath)
            const resolvedFileKey = path.basename(resolvedFileName, resolvedFileExtension || '')

            let resolvedFileStat

            try {
                resolvedFileStat = await fs.lstatAsync(resolvedFilePath)

            } catch (error) {
                resolvedFileStat = null
            }

            const isResolvedDirectory = resolvedFileStat && resolvedFileStat.isDirectory()
            const isResolvedFile = resolvedFileStat && resolvedFileStat.isFile()
            const isResolvedLink = resolvedFileStat && resolvedFileStat.isSymbolicLink()

            const item = {}

            item.level = level

            item.path = filePath
            item.absolutePath = absoluteFilePath
            item.relativePath = relativeFilePath
            item.name = fileName
            item.extension = fileExtension
            item.key = fileKey

            item.resolvedPath = resolvedFilePath
            item.resolvedAbsolutePath = resolvedAbsoluteFilePath
            item.resolvedRelativePath = resolvedRelativePath
            item.resolvedName = resolvedFileName
            item.resolvedExtension = resolvedFileExtension
            item.resolvedKey = resolvedFileKey

            item.isResolvedDirectory = isResolvedDirectory
            item.isResolvedFile = isResolvedFile
            item.isResolvedLink = isResolvedLink

            item.isDirectory = isResolvedDirectory // ~isDirectory
            item.isFile = isResolvedFile // ~isFile
            item.isLink = isLink
            item.isResolved = isResolved

            if (isDirectory && !isLink) {
                try {
                    item.children = await getTree(resolvedFilePath, options, level + 1)

                } catch (error) {
                    throw new Error(`Could not get file system tree: ${resolvedFilePath}`)
                }

            } else {
                item.children = null
            }

            let metaData = ''

            if (typeof meta === 'function') {
                try {
                    metaData = await meta(item)

                } catch (error) {
                    throw new Error(`Could not map item using specified \`meta\` mapper.`)
                }

                if (typeof metaData === 'undefined') {
                    metaData = ''

                } else if (typeof metaData !== 'string') {
                    try {
                        metaData = metaData && JSON.stringify(metaData)
                        metaData = metaData && color.gray(metaData)

                    } catch (error) {
                        metaData = color.red(error)
                    }
                }

            } else if (meta) {
                metaData = meta
            }

            item.meta = metaData

            items.push(item)
        }

        return items

    } catch (error) {
        if (!silent) {
            throw error
        }

        return items
    }
}

// FUTURE: consider support different render view adapters
const inspectTree = async (rootPath = CURRENT_PATH, options = {}, level = ROOT_LEVEL) => {
    let {
        indent,
        silent,
    } = options || {}

    if (indent !== false) {
        indent = !!indent || DEFAULT_INDENT

    } else {
        indent = 0
    }

    let output = ''

    try {
        rootPath = path.resolve(rootPath)

        if (level === ROOT_LEVEL) {
            const rootItemName = color.gray(rootPath)

            output += '\n'
            output += rootItemName
        }

        let items

        try {
            items = await getTree(rootPath, {...options, silent: false})

        } catch (error) {
            throw error
        }

        let prefix

        let itemName
        let itemOutput

        const itemCount = items.length
        const lastItem = items[itemCount - 1]

        for (let item of items) {
            prefix = ''.padStart(indent * level, SPACE)

            if (item === lastItem) {
                prefix += color.gray(BRANCH_ITEM_PREFIX_LAST)

            } else {
                prefix += color.gray(BRANCH_ITEM_PREFIX)
            }

            if (item.isDirectory) {
                if (item.isLink) {
                    itemName = [
                        color.white.bold(item.name),
                        color.gray(BRANCH_ITEM_LINK_SUFFIX),
                        color.gray(item.resolvedRelativePath),
                        item.meta,
                    ].join(' ')

                } else {
                    itemName = [
                        color.white.bold(item.name),
                        item.meta,
                    ].join(' ')
                }

            } else if (item.isFile) {
                if (item.isLink) {
                    itemName = [
                        color.white(item.name),
                        color.gray(BRANCH_ITEM_LINK_SUFFIX),
                        color.gray(item.resolvedRelativePath),
                        item.meta,
                    ].join(' ')

                } else {
                    itemName = [
                        color.white(item.name),
                        item.meta,
                    ].join(' ')
                }

            } else {
                if (item.isLink) {
                    itemName = [
                        color.red(item.name),
                        color.gray(BRANCH_ITEM_LINK_SUFFIX),
                        color.gray(BRANCH_ITEM_LINK_BROKEN),
                        item.meta,
                    ].join(' ')

                } else {
                    itemName = [
                        color.white.red(item.name),
                        item.meta,
                    ].join(' ')
                }
            }

            output += `\n`
            output += `${prefix}${itemName}`

            if (item.children) {
                try {
                    itemOutput = await inspectTree(item.path, options, level + 1)
                } catch (error) {
                    // skip
                }

                if (typeof itemOutput === 'string') {
                    output += itemOutput
                }
            }
        }

        if (level === ROOT_LEVEL) {
            output += `\n\n`

            return output
        }

        return output

    } catch (error) {
        if (!silent) {
            throw error
        }

        output += `    ${error.message}`
        output += '\n\n'

        return output
    }
}

const logTree = async (rootPath = CURRENT_PATH, options = {}) => {
    const output = inspectTree(rootPath, {...options, silent: true})

    process.stdout.write(output)
}


/* =========================================
      EXPORTS
-------------------------------------- */

const get = getTree
const inspect = inspectTree
const log = logTree

module.exports = {
    get,
    getTree,

    inspect,
    inspectTree,

    log,
    logTree,

    color,
}
