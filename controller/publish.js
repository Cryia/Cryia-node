import { PublishModel } from '../models/dashboard'

class Publish {
    async getConfig (req, res, next) {
        const hash = req.params.hash
        try {
            const col = await PublishModel.findOne({hash: hash}, '-_id -__v')
            res.send({
                code: 0,
                data: col
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '获取大屏失败',
                extra: err
            })
        }
    }
}

export default new Publish()
