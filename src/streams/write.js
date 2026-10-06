const fs = require('node:fs')

function createWriteStream(filePath) {
    return fs.createWriteStream(filePath, 
        { encoding: 'utf-8' })
}

module.exports = {
    createWriteStream,
}
