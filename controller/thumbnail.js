import fs from "fs"

const staticPath = process.cwd() + '/public'
const thumbFilePath = "/images/dashboards/"

class Thumbnial {
    save(hash, b64data) {
        const fileName = hash + '.png'
        const imgData = new Buffer(b64data, 'base64')
        const filePath = staticPath + thumbFilePath + fileName

        fs.writeFile(filePath, imgData,  function(err) {
            if (err) {
                console.log(err)
            }
        })

        return thumbFilePath + fileName
    }
}

export default new Thumbnial()
