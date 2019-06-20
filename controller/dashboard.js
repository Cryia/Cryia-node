import fs from 'fs'
import cmd from 'child_process'

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
        const widget = req.body.widget
        const img = req.body.imgData
        const imgUrl = Thumbnial.save(hash, img.substring(22))

        let config = req.body.config
        config.timestamp = new Date().getTime()

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

        let template

        if (payload.template && payload.template != "blank") {
            if (payload.mode === 'clone') {
                template = await DashboardModel.findOne({hash: payload.template})
            } else {
                template = await TemplateModel.findOne({hash: payload.template})
            }
        }

        const dashboard = {
            hash: hash,
            config: {
                page: true,
                title: payload.name,
                about: payload.about || '',
                width: template ? template.config.width : 1920,
                height: template ? template.config.height : 1080,
                backgroundColor: template ? template.config.backgroundColor : '#FFFFFF',
                backPic: template ? template.config.backPic : '',
                zoom: template ? template.config.zoom : 100,
                timestamp: new Date().getTime()
            },
            widget: template ? template.widget : [],
            publish: {
                url: '',
                status: 'unpublish'
            },
            isTemplate: !(!payload.isTemplate) ,
            imgUrl: '',
            user: user,
            project: payload.project,
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
        function projectFilter(str) {
            switch (str) {
                case 'all':
                    return ''
                case 'ungrouped':
                    return '^$'
                default:
                    return str
            }
        }

        const {limit = 20, page = 1, title = '.*', status = '.*', project = '.*'} = req.query;
        const user = req.params.id
        const offset = (page - 1) * limit

        try {
            const cols = await DashboardModel.find({
                                                    'user': user,
                                                    'project': {$regex: projectFilter(project)},
                                                    'config.title': {$regex: title},
                                                    'publish.status': {$regex: status}
                                                    },
                                                    '-_id -user -widget -__v')
                                            .sort({timestamp: -1})
                                            .skip(Number(offset))
                                            .limit(Number(limit))

            const totle = await DashboardModel.count({'user': user, 'project': {$regex: projectFilter(project)}})
            res.send({
                code: 0,
                data: {
                    items:cols,
                    total:totle
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
            case 'unpublish' :
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

    async download (req, res, next) {
        const hash = req.params.hash
        let col
        try {
            col = await PublishModel.findOne({hash: hash}, 'widget config')
            if (!col) {
                res.send({
                    code: 1,
                    msg: '大屏未发布'
                })

                return
            }
        } catch (err) {
            res.send({
                code: 1,
                msg: '获取大屏失败',
                extra: err
            })
            return
        }

        const staticPath = process.cwd() + '/public/files/'
        const fileName = hash + '.json'
        const filePath = staticPath + fileName

        await fs.writeFile(filePath, JSON.stringify(col),  function(err) {
            if (err) {
                console.log(err)
            }
        })

        cmd.execFile(process.cwd() +'/scripts/pack.sh', [filePath], null, function (err, stdout, stderr) {
            if (err || stderr) {
                res.send({
                    code: 1,
                    msg: "文件打包失败, 请重试",
                    extra: err || stderr
                })
            } else {
                res.send({
                    code: 0,
                    data: stdout
                })
            }
        })  
    }

    async move (req, res, next) {
        const hash = req.params.hash
        const project= req.params.key

        console.log(hash, project)
        try {
            await DashboardModel.findOneAndUpdate({hash: hash}, {$set: {project: project}})
            res.send({
                code: 0
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '移动分组失败',
                extra: err
            })
        }
    }
}

export default new Dashboard()
