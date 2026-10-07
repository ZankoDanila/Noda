const fs = require('node:fs/promises')
const path = require('node:path')
const { Worker } = require('node:worker_threads')


const INPUT_FILE = path.join(
    process.cwd(),
    'data',
    'large-reviews.jsonl'
)


async function loadReviews() {
    const content = await fs.readFile(INPUT_FILE, 'utf-8')

    return content
        .split('\n')
        .filter((line) => line.trim() !== '')
        .map((line) => JSON.parse(line))
}


function heavyCalculation(reviews) {
    let result = 0

    for (const review of reviews) {
        const text = JSON.stringify(review)

        for (let i = 0; i < 200; i++) {
            for (let j = 0; j < text.length; j++) {
                result = (result + text.charCodeAt(j) * (i + 1)) % 1000000007
            }
        }
    }

    return {
        reviewsCount: reviews.length,
        calculationResult: result,
    }
}


async function runMainThread(reviews) {
    console.log('Расчет в главном потоке...')

    const start = performance.now()

    const result = heavyCalculation(reviews)

    const end = performance.now()

    console.log('Результат:', result)
    console.log(`Время: ${(end - start).toFixed(2)} мс`)
}


function runWorker(reviews) {
    return new Promise((resolve, reject) => {
        const worker = new Worker(
            path.join(__dirname, 'statisticsWorker.js')
        )

        const start = performance.now()

        const timer = setInterval(() => {
            console.log('Главный поток продолжает отвечать...')
        }, 200)

        worker.on('message', (result) => {
            const end = performance.now()

            clearInterval(timer)

            console.log('Результат Worker:', result)
            console.log(`Время Worker: ${(end - start).toFixed(2)} мс`)

            resolve()
        })

        worker.on('error', (error) => {
            clearInterval(timer)
            reject(error)
        })

        worker.postMessage(reviews)
    })
}


async function main() {
    const reviews = await loadReviews()

    console.log(`Всего загружено отзывов: ${reviews.length}`)

    const calculationReviews = reviews.slice(0, 5000)

    console.log(
        `Для CPU-расчета используется отзывов: ${calculationReviews.length}`
    )

    await runMainThread(calculationReviews)

    console.log()

    await runWorker(calculationReviews)
}


main().catch((error) => {
    console.error('Ошибка Worker:', error.message)
})
