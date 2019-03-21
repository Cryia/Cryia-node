import DashboardModel from '../models/dashboard'
import crypto from 'crypto'
import formidable from "formidable";
import UserModel from "../models/user";
import dtime from "time-formater";

class Dashboard {
    constructor(){
    }

    static Hash(str){
        const md5 = crypto.createHash('md5');
        return md5.update(str).digest('hex');
    }

    async getSetting(req, res, next) {
        const hash = req.params.hash
        try{
            const col = await DashboardModel.findOne({hash: hash}, '-_id -user -__v')
            res.send({
                code: 0,
                data: col
            })
        }catch(err){
            res.send({
                code: 1,
                msg: '获取大屏失败'
            })
        }
    }
    async update(req, res, next) {
        const hash = req.params.hash
        const config = req.body.config

        try{
            await DashboardModel.findOneAndUpdate({hash: hash}, {$set: {config: config}});
            res.send({
                code: 0
            })
        }catch(err){
            res.send({
                code: 1,
                msg: '保存失败'
            })
        }
    }
    async create(req, res, next) {
        const payload = req.body
        const user = req.params.id
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

        const hash = Dashboard.Hash(user + new Date())


        const newDashboard = {
            user: user,
            name: payload.name,
            hash: hash,
            timestamp: payload.timestamp || Number(new Date()),
            status: 'developing',
            template: payload.template,
            description: payload.description
        }

        await DashboardModel.create(newDashboard)
        res.send({
            code: 0,
            msg: '创建成功',
            hash: hash
        })
    }
    async delete(req, res, next) {
        const hash = req.params.hash
        try{
            const col = await DashboardModel.remove({hash: hash})
            res.send({
                code: 0,
                data: col
            })
        }catch(err){
            res.send({
                code: 1,
                msg: '删除失败'
            })
        }
    }
}

export default new Dashboard()
