const fs = require('node:fs/promises')
const path = require('node:path')

const INDEX_FILE_PATH = path.join(
    process.cwd(),
    'data',
    'index.json'
)

const RESULT_CODES = {
    SUCCESS: 0,
    INVALID_ARGUMENT: 1,
    NOT_FOUND: 2,
    INVALID_JSON: 3,
    FILE_ERROR: 4,
}

async function readIndex() {
    try {
        const fileContent = await fs.readFile(
            INDEX_FILE_PATH,
            'utf-8'
        )

        const index = JSON.parse(fileContent)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Индекс успешно прочитан.',
            data: index,
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: 'Ошибка: файл индекса не найден.',
            }
        }

        if (error instanceof SyntaxError) {
            return {
                statusCode: RESULT_CODES.INVALID_JSON,
                message: 'Ошибка: файл индекса содержит некорректный JSON.',
            }
        }

        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при чтении индекса: ${error.message}`,
        }
    }
}

async function writeIndex(index) {
    try {
        if (!Array.isArray(index)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: индекс должен быть массивом.',
            }
        }

        await fs.writeFile(
            INDEX_FILE_PATH,
            JSON.stringify(index, null, 2),
            'utf-8'
        )

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Индекс успешно сохранен.',
            data: index,
        }
    }
    catch (error) {
        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при сохранении индекса: ${error.message}`,
        }
    }
}

async function addSensorToIndex(sensorId) {
    try {
        if (typeof sensorId !== 'string' || sensorId.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать ID датчика.',
            }
        }

        if (!/^\d+$/.test(sensorId)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: ID датчика должен содержать только цифры.',
            }
        }

        const indexResult = await readIndex()

        if (indexResult.statusCode !== RESULT_CODES.SUCCESS) {
            return indexResult
        }

        const index = indexResult.data

        if (index.includes(sensorId)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: `Ошибка: датчик с ID ${sensorId} уже присутствует в индексе.`,
            }
        }

        index.push(sensorId)
        index.sort((a, b) => Number(a) - Number(b))

        return await writeIndex(index)
    }
    catch (error) {
        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при добавлении датчика в индекс: ${error.message}`,
        }
    }
}

async function removeSensorFromIndex(sensorId) {
    try {
        if (typeof sensorId !== 'string' || sensorId.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать ID датчика.',
            }
        }

        if (!/^\d+$/.test(sensorId)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: ID датчика должен содержать только цифры.',
            }
        }

        const indexResult = await readIndex()

        if (indexResult.statusCode !== RESULT_CODES.SUCCESS) {
            return indexResult
        }

        const index = indexResult.data

        if (!index.includes(sensorId)) {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: `Ошибка: датчик с ID ${sensorId} отсутствует в индексе.`,
            }
        }

        const newIndex = index.filter((id) => id !== sensorId)

        return await writeIndex(newIndex)
    }
    catch (error) {
        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при удалении датчика из индекса: ${error.message}`,
        }
    }
}

module.exports = {
    readIndex,
    writeIndex,
    addSensorToIndex,
    removeSensorFromIndex,
}
