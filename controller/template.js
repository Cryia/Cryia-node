import TemplateModel from '../models/template'
import DashboardModel from "../models/dashboard";
import Thumbnial from "./thumbnail";

class Template {
    static Hash(str){
        const md5 = crypto.createHash('md5');
        return md5.update(str).digest('hex');
    }
    async getAll(req, res, next) {
        const {limit = 20, offset = 0} = req.query;
        try{
            const list = await TemplateModel.find({}, '-_id -config -__v').sort({id: -1}).skip(Number(offset)).limit(Number(limit))
            res.send({
                code: 0,
                data: {
                    items:list,
                    total:list.length
                }
            })
        }catch(err){
            res.send({
                code: 0,
                msg: '获取模板列表失败',
                extra: err
            })
        }
    }
    async update(req, res, next) {
        const hash = req.params.hash
        const config = req.body.config
        const img = req.body.imgData

        try{
            await TemplateModel.findOneAndUpdate({hash: hash}, {$set: {config: config}});

            // const newThumb = new Thumbnial()
            Thumbnial.save(hash, img.substring(22))

            res.send({
                code: 0
            })
        }catch(err){
            res.send({
                code: 1,
                msg: '保存失败',
                extra: err
            })
        }
    }
    async getConfig(req, res, next) {
        const hash = req.params.hash
        try{
            const col = await TemplateModel.findOne({hash: hash}, '-_id -user -__v')
            res.send({
                code: 0,
                data: col
            })
        }catch(err){
            res.send({
                code: 1,
                msg: '获取大屏失败',
                extra: err
            })
        }
    }
    async create(req, res, next) {
        const payload = req.body
        const level = payload.level
        const name  = payload.name
        const author  = payload.author || 'admin'

        try{
            if(!payload.name){
                throw new Error('大屏名称不能为空')
            }
        }catch(err){
            res.send({
                code: 1,
                message: err.message,
            })
            return
        }

        const hash = Template.Hash(author + new Date())


        const newTemplate = {
            hash: hash,
            name: name,
            level: level || 0,
            author: author,
            timestamp: Number(new Date()),
        }

        await TemplateModel.create(newTemplate)
        res.send({
            code: 0,
            msg: '创建成功',
            hash: hash
        })
    }
}

export default new Template()
