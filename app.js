const {
    searchSensors,
} = require('./src/cli/search')

const {
    createCommand,
    readCommand,
    updateCommand,
    deleteCommand,
    listCommand,
} = require('./src/cli/commands')


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
                console.error('Ошибка при создании датчика:', error)
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
                console.error('Ошибка при чтении датчика:', error)
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
                console.error('Ошибка при обновлении датчика:', error)
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
                console.error('Ошибка при удалении датчика:', error)
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
                console.error('Ошибка при получении списка датчиков:', error)
            })
        break

    case 'search':
        searchSensors()
            .catch((error) => {
                console.error('Ошибка при поиске датчиков:', error)
            })



    default:
        console.log(
            'Неизвестная команда. Доступные команды: create, read, update, delete, list, search.'
        )
}
