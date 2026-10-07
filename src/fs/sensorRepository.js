const fs = require('node:fs/promises')
const path = require('node:path')

const SENSORS_DIRECTORY = path.join(
    process.cwd(), 
    'data', 
    'sensors'
)

const RESULT_CODES = {
    SUCCESS: 0,
    INVALID_ARGUMENT: 1,
    NOT_FOUND: 2,
    INVALID_JSON: 3,
    FILE_ERROR: 4,
}


async function readSensorById(sensorId) {
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

        const sensorFilePath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`,
        )

        const fileContent = await fs.readFile(
            sensorFilePath, 
            'utf-8'
        )

        const sensor = JSON.parse(fileContent)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Датчик успешно прочитан.',
            data: sensor,
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: `Ошибка: датчик с ID ${sensorId} не найден.`,
            }
        }

        if (error instanceof SyntaxError) {
            return {
                statusCode: RESULT_CODES.INVALID_JSON,
                message: `Ошибка: файл датчика ${sensorId}.json содержит некорректный JSON.`,
            }
        }

        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при чтении датчика: ${error.message}`,
        }
    }
}

async function sensorExists(sensorId) {
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

        const sensorFilePath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`,
        )

        await fs.access(sensorFilePath)


        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Датчик существует.',
            data: true,
        }
    } catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
    message: 'Датчик не найден.',
    data: false,
}
        }


        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при чтении датчика: ${error.message}`,
        }
    }
}

async function deleteSensorById(sensorId) {
    try {
        if (typeof sensorId !== 'string' || sensorId.trim() === '')
        {
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

        const sensorFilePath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`,
        )

        await fs.unlink(sensorFilePath)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Датчик успешно удален.',
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: `Ошибка: датчик с ID ${sensorId} не найден.`,
            }
        }

        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при удалении датчика: ${error.message}`,
        }
    }
}

async function createSensor(sensor) {
    try {
        if (!sensor || typeof sensor !== 'object') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо передать объект датчика.',
            }
        }

        if (!sensor.id || typeof sensor.id !== 'string' || sensor.id.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать ID датчика.',
            }
        }

        if (!/^\d+$/.test(sensor.id)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: ID датчика должен содержать только цифры.',
            }
        }

        if (!sensor.title || typeof sensor.title !== 'string' || sensor.title.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать название датчика.',
            }
        }

        const existsResult = await sensorExists(sensor.id)

        if (existsResult.data === true) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: `Ошибка: датчик с ID ${sensor.id} уже существует.`,
            }
        }

        const sensorFilePath = path.join(
            SENSORS_DIRECTORY,
            `${sensor.id}.json`,
        )

        await fs.writeFile(
            sensorFilePath,
            JSON.stringify(sensor, null, 2),
            'utf-8'
        )

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Датчик успешно создан.',
            data: sensor,
        }
    }
    catch (error) {
        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при создании датчика: ${error.message}`,
        }
    }
}

async function updateSensorById(sensorId, sensor) {

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

        if (!sensor || typeof sensor !== 'object') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо передать объект датчика.',
            }
        }

        const existsResult = await sensorExists(sensorId)

        if (existsResult.data === false) {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: `Ошибка: датчик с ID ${sensorId} не найден.`,
            }
        }

        const sensorFilePath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`,
        )

        await fs.writeFile(
            sensorFilePath,
            JSON.stringify(sensor, null, 2),
            'utf-8'
        )

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Датчик успешно обновлен.',
            data: sensor,
        }
    }
    catch (error) {
        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при обновлении датчика: ${error.message}`,
        }
    }

}

module.exports = {
    readSensorById,
    sensorExists,
    deleteSensorById,
    createSensor,
    updateSensorById,
}
