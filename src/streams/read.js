const fs = require('node:fs')

function createReadStream(filePath) {
    return fs.createReadStream(filePath, 
        { encoding: 'utf-8' })
}

module.exports = {
    createReadStream,
}
