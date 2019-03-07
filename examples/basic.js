
async function main () {

    // =========================================
    //       EXAMPLE
    // --------------------------------------

    const palmtree = require('../')

    const util = require('util')
    const color = require('chalk')
    const fs = require('fs')

    // ---------------------------------------------------
    //   EXAMPLE: plain colorized output
    // ------------------------------------------------

    await palmtree.log('~')

    // ---------------------------------------------------
    //   EXAMPLE: detailed custom colorized output
    // ------------------------------------------------

    await palmtree.log('~', {
        meta: async (item) => {
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
    })

    // ---------------------------------------------------
    //   EXAMPLE: detailed custom colorized result
    // ------------------------------------------------
}

main()
