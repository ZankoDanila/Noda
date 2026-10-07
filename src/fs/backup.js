const fs = require('node:fs/promises')
const path = require('node:path')

const {
    readIndex,
    writeIndex,
} = require('./indexRepository')


const SENSORS_DIRECTORY = path.join(
    process.cwd(),
    'data',
    'sensors'
)

const BACKUP_DIRECTORY = path.join(
    process.cwd(),
    'data',
    'backup',
    'sensors'
)

const RESULT_CODES = {
    SUCCESS: 0,
    INVALID_ARGUMENT: 1,
    NOT_FOUND: 2,
    INVALID_JSON: 3,
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

        await fs.mkdir(
            BACKUP_DIRECTORY,
            { recursive: true }
        )

        await fs.copyFile(
            sourcePath,
            backupPath
        )

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


async function backupDataDirectory() {
    try {
        await fs.access(SENSORS_DIRECTORY)

        await fs.mkdir(
            path.join(process.cwd(), 'data', 'backup'),
            { recursive: true }
        )

        await fs.rm(
            BACKUP_DIRECTORY,
            {
                recursive: true,
                force: true,
            }
        )

        await fs.cp(
            SENSORS_DIRECTORY,
            BACKUP_DIRECTORY,
            {
                recursive: true,
            }
        )

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Резервная копия каталога с данными успешно создана.',
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: 'Ошибка: каталог с данными датчиков не найден.',
            }
        }

        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при резервном копировании каталога: ${error.message}`,
        }
    }
}


async function backupExists(sensorId) {
    try {
        if (typeof sensorId !== 'string' || sensorId.trim() === '') {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: необходимо указать ID датчика.',
                data: false,
            }
        }

        if (!/^\d+$/.test(sensorId)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: ID датчика должен содержать только цифры.',
                data: false,
            }
        }

        const backupPath = path.join(
            BACKUP_DIRECTORY,
            `${sensorId}.json`,
        )

        await fs.access(backupPath)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Резервная копия существует.',
            data: true,
        }
    }
    catch (error) {
        if (error.code === 'ENOENT') {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: 'Резервная копия не найдена.',
                data: false,
            }
        }

        return {
            statusCode: RESULT_CODES.FILE_ERROR,
            message: `Ошибка при проверке резервной копии: ${error.message}`,
            data: false,
        }
    }
}


async function rebackupSensorById(sensorId) {
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

        const sensorPath = path.join(
            SENSORS_DIRECTORY,
            `${sensorId}.json`,
        )

        const backupPath = path.join(
            BACKUP_DIRECTORY,
            `${sensorId}.json`,
        )

        await fs.access(sensorPath)

        const backupResult = await backupExists(sensorId)

        if (backupResult.data !== true) {
            return backupResult
        }

        await fs.copyFile(
            sensorPath,
            backupPath,
        )

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: 'Резервная копия датчика успешно обновлена.',
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
            message: `Ошибка при обновлении резервной копии: ${error.message}`,
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

        if (
            !/^\d+$/.test(sensorId) ||
            !/^\d+$/.test(newSensorId)
        ) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: ID датчика должен содержать только цифры.',
            }
        }

        if (sensorId === newSensorId) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: 'Ошибка: новый ID совпадает с текущим.',
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

        const indexResult = await readIndex()

        if (indexResult.statusCode !== RESULT_CODES.SUCCESS) {
            return indexResult
        }

        const index = indexResult.data

        if (!index.includes(sensorId)) {
            return {
                statusCode: RESULT_CODES.NOT_FOUND,
                message: `Ошибка: ID ${sensorId} отсутствует в индексном файле.`,
            }
        }

        if (index.includes(newSensorId)) {
            return {
                statusCode: RESULT_CODES.INVALID_ARGUMENT,
                message: `Ошибка: ID ${newSensorId} уже присутствует в индексе.`,
            }
        }

        sensor.id = newSensorId

        await fs.rename(
            oldPath,
            newPath
        )

        await fs.writeFile(
            newPath,
            JSON.stringify(sensor, null, 2),
            'utf-8'
        )

        const newIndex = index.map((id) => {
            return id === sensorId ? newSensorId : id
        })

        newIndex.sort((a, b) => Number(a) - Number(b))

        await writeIndex(newIndex)

        return {
            statusCode: RESULT_CODES.SUCCESS,
            message: `Датчик переименован с ID ${sensorId} на ${newSensorId}, индекс обновлен.`,
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
                statusCode: RESULT_CODES.INVALID_JSON,
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
    backupDataDirectory,
    backupExists,
    rebackupSensorById,
    renameSensorById,
}
