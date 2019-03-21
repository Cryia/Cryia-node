import UserModel from '../models/user'
import DashboardModel from '../models/dashboard'
import crypto from 'crypto'
import formidable from 'formidable'
import dtime from 'time-formater'

class User {
    constructor(){
        //super()
        this.login = this.login.bind(this)
        this.register = this.register.bind(this)
        this.encryption = this.encryption.bind(this)
        this.updateAvatar = this.updateAvatar.bind(this)
    }
    async login(req, res, next){
        var user_name = req.body.username;
        var user_password = req.body.password;

        try {
            if(!user_name) {
                throw new Error('用户名参数错误');
            }else if(!user_password) {
                throw new Error('密码参数错误');
            }
        }catch(err) {
            // logger.info(err.message, err);
            res.send({
                code: 1,
                msg: "登陆参数错误",
                extra: err.message
            });
            return;
        }
        const newpassword = this.encryption(user_password);
        try {
            const account = await UserModel.findOne({username:user_name});
            if(!account) {
                logger.info('该用户不存在');
                res.send({
                    code: 1,
                    msg: '用户不存在'
                });
            }else if(newpassword.toString() !== account.password.toString()) {
                res.send({
                    code: 1,
                    msg: '密码错误'
                });
            }else{
                if(account.status === 1){
                    res.send({
                        code:1011,
                        msg: '账户已冻结'
                    });
                    return;
                }

                const token = "testToken"
                res.append('Authorization', token);

                res.send({
                    code: 0,
                    id:account._id
                    // msg: '欢迎你' + account.nickname
                });
            }
        }catch(err) {
            //logger.info('登录管理员失败', err);
            res.send({
                code: 1,
                msg: '登陆失败',
                extra: err.message
            });
            return;
        }
    }
    logout(req, res, next) {
        res.send({
            code:0
        })
    }
    async register(req, res, next){
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            if (err) {
                res.send({
                    status: 0,
                    type: 'FORM_DATA_ERROR',
                    message: '表单信息错误'
                })
                return
            }
            const {user_name, password, status = 1} = fields;
            try{
                if (!user_name) {
                    throw new Error('用户名错误')
                }else if(!password){
                    throw new Error('密码错误')
                }
            }catch(err){
                console.log(err.message, err);
                res.send({
                    status: 0,
                    type: 'GET_ERROR_PARAM',
                    message: err.message,
                })
                return
            }
            try{
                const admin = await UserModel.findOne({user_name})
                if (admin) {
                    console.log('该用户已经存在');
                    res.send({
                        status: 0,
                        type: 'USER_HAS_EXIST',
                        message: '该用户已经存在',
                    })
                }else{
                    const adminTip = status == 1 ? '管理员' : '超级管理员'
                    const admin_id = await this.getId('admin_id');
                    const newpassword = this.encryption(password);
                    const newAdmin = {
                        user_name,
                        password: newpassword,
                        id: admin_id,
                        create_time: dtime().format('YYYY-MM-DD'),
                        admin: adminTip,
                        status,
                    }
                    await UserModel.create(newAdmin)
                    req.session.admin_id = admin_id;
                    res.send({
                        status: 1,
                        message: '注册管理员成功',
                    })
                }
            }catch(err){
                console.log('注册管理员失败', err);
                res.send({
                    status: 0,
                    type: 'REGISTER_ADMIN_FAILED',
                    message: '注册管理员失败',
                })
            }
        })
    }
    encryption(password){
        const newpassword = this.Md5(this.Md5(password).substr(2, 7) + this.Md5(password));
        return newpassword
    }
    Md5(password){
        const md5 = crypto.createHash('md5');
        return md5.update(password).digest('base64');
    }
    async singout(req, res, next){
        try{
            delete req.session.admin_id;
            res.send({
                status: 1,
                success: '退出成功'
            })
        }catch(err){
            console.log('退出失败', err)
            res.send({
                status: 0,
                message: '退出失败'
            })
        }
    }
    async getAllAdmin(req, res, next){
        const {limit = 20, offset = 0} = req.query;
        try{
            const allAdmin = await UserModel.find({}, '-_id -password').sort({id: -1}).skip(Number(offset)).limit(Number(limit))
            res.send({
                status: 1,
                data: allAdmin,
            })
        }catch(err){
            console.log('获取超级管理列表失败', err);
            res.send({
                status: 0,
                type: 'ERROR_GET_ADMIN_LIST',
                message: '获取超级管理列表失败'
            })
        }
    }
    async getAdminCount(req, res, next){
        try{
            const count = await UserModel.count()
            res.send({
                status: 1,
                count,
            })
        }catch(err){
            console.log('获取管理员数量失败', err);
            res.send({
                status: 0,
                type: 'ERROR_GET_ADMIN_COUNT',
                message: '获取管理员数量失败'
            })
        }
    }
    async getAccountInfo(req, res, next){
        const user = req.params.id
        try{
            const info = await UserModel.findOne({_id: user}, '-_id -__v -password -username');
            if (!info) {
                throw new Error('未找到当前用户')
            }else{
                res.send({
                    code: 0,
                    data: info
                })
            }
        }catch(err){
            console.log('获取用户信息失败');
            res.send({
                code: 1,
                msg: '获取用户信息失败'
            })
        }
    }
    async updateAvatar(req, res, next){
        const admin_id = req.params.admin_id;
        if (!admin_id || !Number(admin_id)) {
            console.log('admin_id参数错误', admin_id)
            res.send({
                status: 0,
                type: 'ERROR_ADMINID',
                message: 'admin_id参数错误',
            })
            return
        }

        try{
            const image_path = await this.getPath(req);
            await UserModel.findOneAndUpdate({id: admin_id}, {$set: {avatar: image_path}});
            res.send({
                status: 1,
                image_path,
            })
            return
        }catch(err){
            console.log('上传图片失败', err);
            res.send({
                status: 0,
                type: 'ERROR_UPLOAD_IMG',
                message: '上传图片失败'
            })
            return
        }
    }
    async getDashboards(req, res, next) {
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

export default new User()
