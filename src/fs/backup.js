const fs = require('node:fs/promises')
const path = require('node:path')

const SENSORS_DIRECTORY = path.join(
    process.cwd(),
    'data',
    'sensors'
)

const BACKUP_DIRECTORY = path.join(
    process.cwd(),
    'data',
    'backup'
)

const RESULT_CODES = {
    SUCCESS: 0,
    INVALID_ARGUMENT: 1,
    NOT_FOUND: 2,
    FILE_ERROR: 4,
}


async function backupSensorById(sensorId) {
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

        const sourcePath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`
        )

        const backupPath = path.join(
            BACKUP_DIRECTORY,
            `${sensorId}.json`
        )

        await fs.mkdir(BACKUP_DIRECTORY, { recursive: true })

        await fs.copyFile(sourcePath, backupPath)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Резервная копия датчика успешно создана.',
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
            message: `Ошибка при создании резервной копии: ${error.message}`,
        }
    }
}


async function renameSensorById(sensorId, newSensorId) {
    try {
        if (typeof sensorId !== 'string' || sensorId.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать текущий ID датчика.',
            }
        }

        if (typeof newSensorId !== 'string' || newSensorId.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать новый ID датчика.',
            }
        }

        if (!/^\d+$/.test(sensorId) || !/^\d+$/.test(newSensorId)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: ID датчика должен содержать только цифры.',
            }
        }

        const oldPath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`
        )

        const newPath = path.join(
            SENSORS_DIRECTORY,
            `${newSensorId}.json`
        )

        await fs.access(oldPath)

        try {
            await fs.access(newPath)

            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: `Ошибка: датчик с ID ${newSensorId} уже существует.`,
            }
        }
        catch (error) {
            if (error.code !== 'ENOENT') {
                throw error
            }
        }

        const fileContent = await fs.readFile(
            oldPath,
            'utf-8'
        )

        const sensor = JSON.parse(fileContent)

        sensor.id = newSensorId

        await fs.writeFile(
            newPath,
            JSON.stringify(sensor, null, 2),
            'utf-8'
        )

        await fs.unlink(oldPath)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: `Датчик переименован с ID ${sensorId} на ${newSensorId}.`,
            data: sensor,
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: `Ошибка: датчик с ID ${sensorId} не найден.`,
            }
        }

        if (error instanceof SyntaxError) {
            return {
                statusCode: 3,
                message: `Ошибка: файл датчика ${sensorId}.json содержит некорректный JSON.`,
            }
        }

        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при переименовании датчика: ${error.message}`,
        }
    }
}


module.exports = {
    backupSensorById,
    renameSensorById,
}
