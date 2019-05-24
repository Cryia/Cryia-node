'use strict'

import express from 'express'
import User from '../controller/user'
import Dashboard from '../controller/dashboard'
import Template from '../controller/template'
import Publish from '../controller/publish'
import Upload from '../controller/upload'

import v1 from './v1'

const router = express.Router()

// 用户登录
router.post('/user/login', User.login)
router.post('/user/logout', User.logout)

// 获取用户信息
router.get('/user/:id/info', User.getAccountInfo)
router.post('/user/:id/account', User.updateAccount)

// 大屏管理
router.get('/user/:id/dashboards', Dashboard.getListForUser)
router.post('/user/:id/dashboards', Dashboard.create)
router.get('/dashboards/:hash', Dashboard.getConfig)
router.put('/dashboards/:hash', Dashboard.update)
router.delete('/dashboards/:hash', Dashboard.delete)
router.get('/download/dashboards/:hash', Dashboard.download)

// 发布管理
router.post('/publish/:hash', Dashboard.publish)
router.get('/publish/:hash', Publish.getConfig)

// 模板管理
router.get('/templates', Template.getAll)
router.get('/templates/:hash', Dashboard.getConfig)
router.post('/templates', Dashboard.create)
router.put('/templates/:hash', Dashboard.update)
router.delete('/templates/:hash', Dashboard.delete)

// 上传文件
router.post('/upload/image/:hash', Upload.image)

export default app => {
  app.use('', router)
  app.use('/v1', v1)
}
