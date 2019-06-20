import UserModel from '../models/user'
import { DashboardModel } from '../models/dashboard'
import crypto from 'crypto'
import formidable from 'formidable'

class User {
    constructor() {
        //super()
        this.login = this.login.bind(this)
        this.register = this.register.bind(this)
        this.encryption = this.encryption.bind(this)
        this.updateAvatar = this.updateAvatar.bind(this)
        this.updateAccount = this.updateAccount.bind(this)
    }
    async login(req, res, next){
        var user_name = req.body.username
        var user_password = req.body.password

        try {
            if (!user_name) {
                throw new Error('用户名参数错误')
            } else if (!user_password) {
                throw new Error('密码参数错误')
            }
        } catch (err) {
            // logger.info(err.message, err)
            res.send({
                code: 1,
                msg: "登陆参数错误",
                extra: err.message
            })
            return
        }

        const newpassword = this.encryption(user_password)
        try {
            const account = await UserModel.findOne({username:user_name})
            if (!account) {
                logger.info('该用户不存在')
                res.send({
                    code: 1,
                    msg: '用户不存在'
                })
            } else if (newpassword.toString() !== account.password.toString()) {
                res.send({
                    code: 1,
                    msg: '密码错误'
                })
            } else {
                if (account.status === 1) {
                    res.send({
                        code:1011,
                        msg: '账户已冻结'
                    })
                    return
                }

                const token = "testToken"
                res.append('Authorization', token)

                res.send({
                    code: 0,
                    id:account._id
                    // msg: '欢迎你' + account.nickname
                })
            }
        } catch (err) {
            //logger.info('登录管理员失败', err)
            res.send({
                code: 1,
                msg: '登陆失败',
                extra: err.message
            })
            return
        }
    }
    logout(req, res, next) {
        res.send({
            code:0
        })
    }
    async register(req, res, next) {
        var user_name = req.body.username
        var user_password = req.body.password

        try {
            if (!user_name) {
                throw new Error('用户名参数错误')
            } else if (!user_password) {
                throw new Error('密码参数错误')
            }
        } catch (err) {
            // logger.info(err.message, err)
            res.send({
                code: 1,
                msg: "注册参数错误",
                extra: err.message
            })
            return
        }

        try {
            const user = await UserModel.findOne({username: user_name})
            if (user) {
                res.send({
                    code: 1,
                    type: 'USER_HAS_EXIST',
                    msg: '该用户已经存在'
                })
            } else {
                const newpassword = this.encryption(user_password)
                const newAdmin = {
                    username: user_name,
                    password: newpassword,
                    roles: ['user'],
                    create_time: new Date().getTime()
                }
                await UserModel.create(newAdmin)
                res.send({
                    code: 0,
                    msg: '注册成功'
                })
            }
        } catch (err) {
            res.send({
                code: 2,
                msg: '注册失败',
                extra: err.message
            })
        }
    }
    encryption(password) {
        const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password))
        return newpassword
    }
    Md5(password) {
        const md5 = crypto.createHash('md5')
        return md5.update(password).digest('base64')
    }
    async singout(req, res, next) {
        try {
            delete req.session.admin_id
            res.send({
                status: 1,
                success: '退出成功'
            })
        } catch(err) {
            console.log('退出失败', err)
            res.send({
                status: 0,
                message: '退出失败'
            })
        }
    }
    async getAllAdmin(req, res, next) {
        const {limit = 20, offset = 0} = req.query
        try {
            const allAdmin = await UserModel.find({}, '-_id -password').sort({id: -1}).skip(Number(offset)).limit(Number(limit))
            res.send({
                status: 1,
                data: allAdmin,
            })
        } catch(err) {
            console.log('获取超级管理列表失败', err)
            res.send({
                status: 0,
                type: 'ERROR_GET_ADMIN_LIST',
                message: '获取超级管理列表失败'
            })
        }
    }
    async getAccountInfo(req, res, next) {
        const user = req.params.id
        try {
            const info = await UserModel.findOne({_id: user}, '-_id -__v -password')
            if (!info) {
                throw new Error('未找到当前用户')
            } else {
                res.send({
                    code: 0,
                    data: info
                })
            }
        } catch(err) {
            console.log('获取用户信息失败')
            res.send({
                code: 1,
                msg: '获取用户信息失败'
            })
        }
    }
    async updateAvatar(req, res, next) {
        const admin_id = req.params.admin_id
        if (!admin_id || !Number(admin_id)) {
            console.log('admin_id参数错误', admin_id)
            res.send({
                status: 0,
                type: 'ERROR_ADMINID',
                message: 'admin_id参数错误',
            })
            return
        }

        try {
            const image_path = await this.getPath(req)
            await UserModel.findOneAndUpdate({_id: admin_id}, {$set: {avatar: image_path}})
            res.send({
                status: 1,
                image_path,
            })
        } catch(err) {
            console.log('上传图片失败', err)
            res.send({
                status: 0,
                type: 'ERROR_UPLOAD_IMG',
                message: '上传图片失败'
            })
        }
    }
    async updateAccount(req, res, next) {
        const userId = req.params.id
        const oldPassword = this.encryption(req.body.oldPassword)
        const newPassword = req.body.newPassword

        try {
            if (!oldPassword) {
                throw new Error('原密码参数错误')
            } else if (!newPassword) {
                throw new Error('新密码格式错误')
            }
        } catch (err) {
            // logger.info(err.message, err)
            res.send({
                code: 1,
                msg: "登陆参数错误",
                extra: err.message
            })
            return
        }

        try {
            const account = await UserModel.findOne({_id: userId})
            if (!account) {
                logger.info('该用户不存在')
                res.send({
                    code: 1,
                    msg: '用户不存在'
                })
            } else if (oldPassword.toString() !== account.password.toString()) {
                res.send({
                    code: 1,
                    msg: '原密码错误'
                })
            } else {
                const password = this.encryption(newPassword)
                await UserModel.findOneAndUpdate({_id: userId}, {$set: {password: password}})
                res.send({
                    code: 0
                })
            }
        } catch (err) {
            res.send({
                code: 1,
                msg: '密码修改失败',
                extra: err.message
            })
            return
        }
    }

    async updateProject(req, res, next) {
        const userId = req.params.id
        const projects = req.body.projects

        try {
            await UserModel.findOneAndUpdate({_id: userId}, {$set: {projects: projects}})
            res.send({
                code: 0
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '更新用户分组失败',
                extra: err.message
            })
            return
        }
    }

    async deleteProject(req, res, next) {
        const userId = req.params.id
        const projectKey = req.params.key
        const projects = req.body.projects

        console.log(projectKey, projects)
        try {
            await UserModel.findOneAndUpdate({_id: userId}, {$set: {projects: projects}})
            await DashboardModel.update({project: projectKey}, {$set: {project: ''}}, { multi: true })

            res.send({
                code: 0
            })
        } catch (err) {
            res.send({
                code: 1,
                msg: '更新用户分组失败',
                extra: err.message
            })
            return
        }
    }
}

export default new User()
