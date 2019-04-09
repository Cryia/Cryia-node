import crypto from 'crypto'

export default new Crypto()

export function Hash(str) {
    const md5 = crypto.createHash('md5');
    return str => {md5.update(str).digest('hex');
}
