import crypto from 'crypto'

export function Hash(str) {
    const md5 = crypto.createHash('md5')
    return md5.update(str).digest('hex')
}
