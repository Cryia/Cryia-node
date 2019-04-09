import DashboardModel from '../models/dashboard'
import Thumbnial from '../models/thumbnail'

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

    async getConfig(req, res, next) {
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
                msg: '获取大屏失败',
                extra: err
            })
        }
    }
    async update(req, res, next) {
        const hash = req.params.hash
        const config = req.body.config
        const thumb = req.body.imgData

        try{
            await DashboardModel.findOneAndUpdate({hash: hash}, {$set: {config: config}});
            const newThumb = {
                hash: hash,
                name: name,
                level: level || 0,
                author: author,
                timestamp: Number(new Date()),
            }

            await Thumbnial.update({hash: hash}, {$set: {image: data}});

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
    async getListForUser(req, res, next) {
        const {limit = 20, offset = 0} = req.query;
        const user = req.params.id
        try{
            const cols = await DashboardModel.find({user: user}, '-_id -user -__v').sort({id: -1}).skip(Number(offset)).limit(Number(limit))
            res.send({
                code: 0,
                data: {
                    items:cols,
                    total:cols.length
                }
            })
        }catch(err){
            console.log('获取用户信息失败');
            res.send({
                code: 1,
                msg: '获取用户信息失败'
            })
        }
    }
}

export default new Dashboard()
