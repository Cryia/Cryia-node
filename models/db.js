'use strict'

import mongoose from 'mongoose'
import config from '../config/default'
import UserModel from '../models/user'

mongoose.connect(config.database, { useNewUrlParser: true, useCreateIndex: true })
mongoose.Promise = global.Promise

const db = mongoose.connection

db.once('open', async () => {
    console.log('连接数据库成功')
    try {
        const admin = await UserModel.findOne({username: 'admin'})
        if (!admin) {
            const newAdmin = {
                username: 'admin',
                password: '8JzoHhxmOgq69v8mfYhvXA==',
                roles: ['admin'],
                create_time: new Date().getTime(),
                avatar: 'https://wpimg.wallstcn.com/f778738c-e4f8-4870-b634-56703b4acafe.gif'
            }
            await UserModel.create(newAdmin)
            console.log('创建管理员成功')
        }
    } catch (err) {
        console.log('创建管理员失败', err)
    }

})

db.on('error', function(error) {
    console.error(
        ('Error in MongoDb connection: ' + error)
    )
    mongoose.disconnect()
})

db.on('close', function() {
    console.log(
        ('数据库断开，重新连接数据库')
    )
    mongoose.connect(config.url, {server:{auto_reconnect:true}})
})

export default db
