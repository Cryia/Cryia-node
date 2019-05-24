import fs from "fs"
import path from 'path'
import crypto from 'crypto'

const staticPath = process.cwd() + '/public'

class Uploader {
    constructor() {}

    static Hash(str) {
        const md5 = crypto.createHash('md5')
        return md5.update(str).digest('hex')
    }

    image(req, res) {
        function mkdirsSync(dirname) {
            if (fs.existsSync(dirname)) {
                return true
            } else if (mkdirsSync(path.dirname(dirname))) {
                fs.mkdirSync(dirname)
                return true
            }
        }

        const hash = req.params.hash || 'anony'
        const uploadFilePath = "/upload/dashboard/" + hash + "/img/"
        const destFilePath = staticPath + uploadFilePath

        mkdirsSync(destFilePath)

        return new Promise((resolve, reject) => {
            const form = formidable.IncomingForm()
            form.uploadDir = destFilePath
            form.parse(req, async (err, fields, files) => {
                console.log(files)
                const hashName = Uploader.Hash(files.file.name + new Date())
                const extname = path.extname(files.file.name)

                if (!['.jpg', '.jpeg', '.png'].includes(extname)) {
                    fs.unlinkSync(files.file.path)
                    res.send({
                        code: 1,
                        type: 'ERROR_EXTNAME',
                        message: '文件格式错误'
                    })

                    reject('上传失败')
                    return 
                }

                const fullName = hashName + extname
                const repath = destFilePath + fullName
                try {
                    fs.renameSync(files.file.path, repath)
                    res.send({
                    code: 0,
                    imgUrl: uploadFilePath + fullName
                    })
                } catch(err) {
                    if (fs.existsSync(repath)) {
                        fs.unlinkSync(repath)
                    } else {
                        fs.unlinkSync(files.file.path)
                    }

                    reject('保存图片失败')
                }
            })
        })
    }
}

export default new Uploader()
