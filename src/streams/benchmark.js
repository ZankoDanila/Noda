const fs = require('node:fs/promises')
const fsSync = require('node:fs')
const path = require('node:path')
const { pipeline } = require('node:stream/promises')

const { createReadStream } = require('./read')
const { createWriteStream } = require('./write')
const { ReviewTransform } = require('./transform')


const INPUT_FILE = path.join(
    process.cwd(),
    'data',
    'large-reviews.jsonl'
)

const OUTPUT_FILE = path.join(
    process.cwd(),
    'data',
    'large-reviews-output.jsonl'
)


function getMemoryMb() {
    return process.memoryUsage().rss / 1024 / 1024
}


async function benchmarkReadFile() {
    const start = performance.now()
    const memoryBefore = getMemoryMb()

    const content = await fs.readFile(INPUT_FILE, 'utf-8')

    const memoryAfter = getMemoryMb()
    const end = performance.now()

    return {
        method: 'fs.readFile',
        timeMs: Number((end - start).toFixed(2)),
        memoryMb: Number((memoryAfter - memoryBefore).toFixed(2)),
        bytes: content.length,
    }
}


function benchmarkReadFileSync() {
    const start = performance.now()
    const memoryBefore = getMemoryMb()

    const content = fsSync.readFileSync(INPUT_FILE, 'utf-8')

    const memoryAfter = getMemoryMb()
    const end = performance.now()

    return {
        method: 'fs.readFileSync',
        timeMs: Number((end - start).toFixed(2)),
        memoryMb: Number((memoryAfter - memoryBefore).toFixed(2)),
        bytes: content.length,
    }
}


async function benchmarkStream() {
    const start = performance.now()
    const memoryBefore = getMemoryMb()

    await pipeline(
        createReadStream(INPUT_FILE),
        new ReviewTransform(),
        createWriteStream(OUTPUT_FILE)
    )

    const memoryAfter = getMemoryMb()
    const end = performance.now()

    return {
        method: 'Stream',
        timeMs: Number((end - start).toFixed(2)),
        memoryMb: Number((memoryAfter - memoryBefore).toFixed(2)),
    }
}


async function main() {
    console.log(await benchmarkReadFile())
    console.log(benchmarkReadFileSync())
    console.log(await benchmarkStream())
}


main().catch((error) => {
    console.error('Ошибка benchmark:', error.message)
})
