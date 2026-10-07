const {
    searchSensors,
} = require('./src/cli/search')

const {
    createCommand,
    readCommand,
    updateCommand,
    deleteCommand,
    listCommand,
    rebackupCommand,
    backupAllCommand,
    renameCommand,
} = require('./src/cli/commands')

const {
    backupSensorById,
} = require('./src/fs/backup')


const command = process.argv[2]
const arg1 = process.argv[3]
const arg2 = process.argv[4]


switch (command) {
    case 'create':
        createCommand(arg1, arg2)
            .then((result) => {
                console.log(result.message)

                if (result.data) {
                    console.log(result.data)
                }
            })
            .catch((error) => {
                console.error(
                    'Ошибка при создании датчика:',
                    error
                )
            })
        break


    case 'read':
        readCommand(arg1)
            .then((result) => {
                console.log(result.message)

                if (result.data) {
                    console.log(result.data)
                }
            })
            .catch((error) => {
                console.error(
                    'Ошибка при чтении датчика:',
                    error
                )
            })
        break


    case 'update':
        updateCommand(arg1, arg2)
            .then((result) => {
                console.log(result.message)

                if (result.data) {
                    console.log(result.data)
                }
            })
            .catch((error) => {
                console.error(
                    'Ошибка при обновлении датчика:',
                    error
                )
            })
        break


    case 'delete':
        deleteCommand(arg1)
            .then((result) => {
                console.log(result.message)

                if (result.data) {
                    console.log(result.data)
                }
            })
            .catch((error) => {
                console.error(
                    'Ошибка при удалении датчика:',
                    error
                )
            })
        break


    case 'list':
        listCommand()
            .then((result) => {
                console.log(result.message)

                if (result.data) {
                    console.log(result.data)
                }
            })
            .catch((error) => {
                console.error(
                    'Ошибка при получении списка датчиков:',
                    error
                )
            })
        break


    case 'search':
        searchSensors()
            .catch((error) => {
                console.error(
                    'Ошибка при поиске датчиков:',
                    error
                )
            })
        break


    case 'backup':
        backupSensorById(arg1)
            .then((result) => {
                console.log(result.message)
            })
            .catch((error) => {
                console.error(
                    'Ошибка при резервном копировании датчика:',
                    error
                )
            })
        break


    case 'rebackup':
        rebackupCommand(arg1)
            .then((result) => {
                console.log(result.message)
            })
            .catch((error) => {
                console.error(
                    'Ошибка при обновлении резервной копии:',
                    error
                )
            })
        break

case 'backup-all':
    backupAllCommand()
        .then((result) => {
            console.log(result.message)
        })
        .catch((error) => {
            console.error(
                'Ошибка при резервном копировании каталога:',
                error
            )
        })
    break


case 'rename':
    renameCommand(arg1, arg2)
        .then((result) => {
            console.log(result.message)

            if (result.data) {
                console.log(result.data)
            }
        })
        .catch((error) => {
            console.error(
                'Ошибка при переименовании датчика:',
                error
            )
        })
    break

    default:
        console.log(
            'Неизвестная команда. Доступные команды: ' +
            'create, read, update, delete, list, search, backup, rebackup, backup-all, rename.'
        )
}
