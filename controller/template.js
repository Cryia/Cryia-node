import { TemplateModel } from '../models/dashboard'

class Template {
    async getAll(req, res, next) {
        const {limit = 20, offset = 0} = req.query;
        try {
            let list = await TemplateModel.find({}, '-_id -widget -__v').sort({id: -1}).skip(Number(offset)).limit(Number(limit))

            res.send({
                code: 0,
                data: {
                    items:list,
                    total:list.length
                }
            })
        } catch(err) {
            res.send({
                code: 0,
                msg: '获取模板列表失败',
                extra: err
            })
        }
    }
}

export default new Template()
