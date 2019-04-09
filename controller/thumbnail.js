import ThumbnialModel from "../models/thumbnail";
import fs from "fs"

const thumbFilePath = "/home/zhangzf/nodejs/Cryia-server/public/images/dashboards/"

class Thumbnial {
    save(hash, b64data) {
        console.log("save")
        console.log(hash)
        const fileName = hash + '.png'
        const imgData = new Buffer(b64data, 'base64')

        fs.writeFile(thumbFilePath + fileName, imgData,  function(err) {
            if (err) {
                console.log(err)
            }
        })
    }

    getPNG(req, res, next) {
        res.send("hehe")
    }
}

export default new Thumbnial()
