
async function main () {

    /* =======================================================
        IMPORTS
    ----------------------------------------------------- */

    const palmtree = require('../')

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
        EXAMPLE: inspect plain colorized output
    ----------------------------------------------------- */

    console.log(`[inspect/plain]: plain colorized output`)

    let inspection = await palmtree.inspect('./test/__fixtures__/foo')

    console.log('[inspect/plain]:', inspection)

    /* =======================================================
        EXAMPLE: inspect detailed custom colorized output
    ----------------------------------------------------- */

    console.log(`[inspect/detailed]: detailed custom colorized output`)

    inspection = await palmtree.inspect('./test/__fixtures__/foo', {meta})

    console.log('[inspect/detailed]:', inspection)

    /* =======================================================
        EXAMPLE: get plain object
    ----------------------------------------------------- */

    console.log(`[get/plain]: plain colorized output`)

    let tree = await palmtree.get('./test/__fixtures__/foo')

    console.log('[get/plain]:', tree)

    /* =======================================================
        EXAMPLE: get detailed object
    ----------------------------------------------------- */

    console.log(`[get/detailed]: detailed custom colorized output`)

    tree = await palmtree.get('./test/__fixtures__/foo', {meta})

    console.log('[get/detailed]:', tree)
}

main()
