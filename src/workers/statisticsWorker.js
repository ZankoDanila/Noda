const { parentPort } = require('node:worker_threads')


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


parentPort.on('message', (reviews) => {
    const result = heavyCalculation(reviews)

    parentPort.postMessage(result)
})
