import { DashboardModel, TemplateModel, PublishModel } from '../models/dashboard'
import Thumbnial from "./thumbnail";

import { Hash } from '../utils/crypto'

class Dashboard {
    constructor() {}

    async getConfig (req, res, next) {
        const hash = req.params.hash
        const dbModel = (req.originalUrl.indexOf('template') === 1) ? TemplateModel : DashboardModel
        try {
            const col = await dbModel.findOne({hash: hash}, '-_id -user -__v')
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

    async update (req, res, next) {
        const hash = req.params.hash
        const config = req.body.config
        const widget = req.body.widget
        const img = req.body.imgData

        const imgUrl = Thumbnial.save(hash, img.substring(22))

        const dbModel = (req.originalUrl.indexOf('template') === 1) ? TemplateModel : DashboardModel
        try {
            await dbModel.findOneAndUpdate({hash: hash}, {$set: {
                                                            config: config,
                                                            imgUrl: imgUrl,
                                                            widget: widget}
                                                        })

            res.send({
                code: 0
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '保存失败',
                extra: err
            })
        }
    }

    async create (req, res, next) {
        const payload = req.body
        try {
            if(!payload.name){
                throw new Error('大屏名称不能为空')
            }
        } catch (err) {
            res.send({
                code: 1,
                message: err.message
            })
            return
        }

        const user = req.params.id
        const hash = Hash(user + new Date())

        if (payload.template && payload.template != "blank") {
            var template = await TemplateModel.findOne({hash: payload.template})
        }

        const dashboard = {
            hash: hash,
            config: {
                title: payload.name,
                about: payload.about || '',
                width: template ? template.config.width : 1920,
                height: template ? template.config.height : 1080,
                zoom: template ? template.config.zoom : 100,
                backgroundColor: template ? template.config.backgroundColor : '#FFFFFF',
                backPic: template ? template.config.backPic : '',
                timestamp: new Date().getTime()
            },
            widget: template ? template.widget : [],
            publish: {
                url: '',
                status: 'unpublished'
            },
            isTemplate: !(!payload.isTemplate) ,
            imgUrl: '',
            user: user,
            timestamp: new Date().getTime()
        }

        const dbModel = dashboard.isTemplate ? TemplateModel : DashboardModel
        await dbModel.create(dashboard)
        res.send({
            code: 0,
            msg: '创建成功',
            hash: hash
        })
    }

    async delete (req, res, next) {
        const hash = req.params.hash

        const dbModel = (req.originalUrl.indexOf('template') === 1) ? TemplateModel : DashboardModel
        try {
            await dbModel.remove({hash: hash})
            res.send({
                code: 0
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '删除失败'
            })
        }
    }

    async getListForUser (req, res, next) {
        const {limit = 20, offset = 0} = req.query;
        const user = req.params.id
        try {
            const cols = await DashboardModel.find({user: user}, '-_id -user -widget -__v')
                                            .sort({id: -1})
                                            .skip(Number(offset))
                                            .limit(Number(limit))
            res.send({
                code: 0,
                data: {
                    items:cols,
                    total:cols.length
                }
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '获取大屏列表失败'
            })
        }
    }

    async publish (req, res, next) {
        const hash = req.params.hash
        const option = req.body.option
        let dashboardCol

        try {
            dashboardCol = await DashboardModel.findOne({hash: hash}, '-_id -__v')
        } catch (err) {
            res.send({
                code: 1,
                msg: '获取大屏信息失败'
            })

            return
        }

        dashboardCol.publish.status = option
        dashboardCol.publish.timestamp = new Date().getTime()

        switch (option) {
            case 'unpublished' :
                await PublishModel.remove({hash: dashboardCol.publish.hash})
                dashboardCol.publish.hash = ''
                break
            case 'published' :
                const pubHash = Hash(dashboardCol.hash + new Date())
                dashboardCol.publish.hash = pubHash
                try {
                    await PublishModel.create({
                        hash: pubHash,
                        config: dashboardCol.config,
                        widget: dashboardCol.widget
                    })
                } catch (err) {
                    console.log(err)
                }
                
                break
            case 'republish' :
                dashboardCol.publish.status = 'published'
                await PublishModel.findOneAndUpdate({hash: dashboardCol.publish.hash}, {$set: {config: dashboardCol.config, widget: dashboardCol.widget}})
                break
        }

        try {
            await DashboardModel.findOneAndUpdate({hash: hash}, {$set: {publish: dashboardCol.publish}})

            res.send({
                code: 0
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '更新失败',
                extra: err
            })
        }
    }
}

export default new Dashboard()
