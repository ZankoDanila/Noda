const { Transform } = require('node:stream')


class ReviewTransform extends Transform {
    constructor() {
        super({
            decodeStrings: false,
        })

        this.buffer = ''
    }

    _transform(chunk, encoding, callback) {
        try {
            this.buffer += chunk

            const lines = this.buffer.split('\n')

            this.buffer = lines.pop()

            for (const line of lines) {
                const trimmedLine = line.trim()

                if (trimmedLine === '') {
                    continue
                }

                const review = JSON.parse(trimmedLine)

                this.push(`${JSON.stringify(review)}\n`)
            }

            callback()
        }
        catch (error) {
            callback(error)
        }
    }

    _flush(callback) {
        try {
            const trimmedLine = this.buffer.trim()

            if (trimmedLine !== '') {
                const review = JSON.parse(trimmedLine)
                this.push(`${JSON.stringify(review)}\n`)
            }

            callback()
        }
        catch (error) {
            callback(error)
        }
    }
}


module.exports = {
    ReviewTransform,
}
