const {
    createSensor,
    readSensorById,
    updateSensorById,
    deleteSensorById,
} = require('../fs/sensorRepository')

const {
    readIndex,
    addSensorToIndex,
    removeSensorFromIndex,
} = require('../fs/indexRepository')


async function createCommand(sensorId, title) {
    if (!sensorId || !title) {
        return {
            statusCode: 1,
            message: 'Ошибка: для создания нужны ID и название датчика.',
        }
    }

    const sensor = {
        id: sensorId,
        title,
    }

    const createResult = await createSensor(sensor)

    if (createResult.statusCode !== 0) {
        return createResult
    }

    const indexResult = await addSensorToIndex(sensorId)

    if (indexResult.statusCode !== 0) {
        return indexResult
    }

    return {
        statusCode: 0,
        message: 'Датчик успешно создан и добавлен в индекс.',
        data: sensor,
    }
}


async function readCommand(sensorId) {
    if (!sensorId) {
        return {
            statusCode: 1,
            message: 'Ошибка: необходимо указать ID датчика.',
        }
    }

    return await readSensorById(sensorId)
}


async function updateCommand(sensorId, title) {
    if (!sensorId || !title) {
        return {
            statusCode: 1,
            message: 'Ошибка: для обновления нужны ID и новое название.',
        }
    }

    const sensor = {
        id: sensorId,
        title,
    }

    return await updateSensorById(sensorId, sensor)
}


async function deleteCommand(sensorId) {
    if (!sensorId) {
        return {
            statusCode: 1,
            message: 'Ошибка: необходимо указать ID датчика.',
        }
    }

    const deleteResult = await deleteSensorById(sensorId)

    if (deleteResult.statusCode !== 0) {
        return deleteResult
    }

    const indexResult = await removeSensorFromIndex(sensorId)

    if (indexResult.statusCode !== 0) {
        return indexResult
    }

    return {
        statusCode: 0,
        message: 'Датчик успешно удален из файловой системы и индекса.',
    }
}


async function listCommand() {
    return await readIndex()
}


module.exports = {
    createCommand,
    readCommand,
    updateCommand,
    deleteCommand,
    listCommand,
}
