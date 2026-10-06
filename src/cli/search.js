const readline = require('node:readline')

const {
    readIndex,
} = require('../fs/indexRepository')

const {
    readSensorById,
} = require('../fs/sensorRepository')


async function searchSensors() {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout,
    })

    const query = await new Promise((resolve) => {
        rl.question('Введите название датчика для поиска: ', resolve)
    })

    rl.close()

    const indexResult = await readIndex()

    if (indexResult.statusCode !== 0) {
        console.log(indexResult.message)
        return
    }

    const searchQuery = query.trim().toLowerCase()

    if (searchQuery === '') {
        console.log('Ошибка: поисковый запрос не может быть пустым.')
        return
    }

    let found = 0

    for (const sensorId of indexResult.data) {
        const sensorResult = await readSensorById(sensorId)

        if (sensorResult.statusCode !== 0) {
            continue
        }

        if (sensorResult.data.title.toLowerCase().includes(searchQuery)) {
            console.log(sensorResult.data)
            found++
        }
    }

    if (found === 0) {
        console.log('Датчики по запросу не найдены.')
    }
}


module.exports = {
    searchSensors,
}
