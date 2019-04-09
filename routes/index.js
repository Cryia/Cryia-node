'use strict'

import express from 'express'
import User from '../controller/user'
import Dashboard from '../controller/dashboard'
import Template from '../controller/template'
import Thumbnail from '../controller/thumbnail'

const router = express.Router()

// 用户登录
router.post('/user/login', User.login)
router.post('/user/logout', User.logout)

// 获取用户信息
router.get('/user/:id/info', User.getAccountInfo)

// 获取用户大屏列表
router.get('/user/:id/dashboards', Dashboard.getListForUser)

// 新建大屏
router.post('/user/:id/dashboards', Dashboard.create)

// 获取大屏内容
router.get('/dashboards/:hash', Dashboard.getConfig)

// 保存编辑内容
router.put('/dashboards/:hash', Dashboard.update)

// 删除大屏
router.delete('/dashboards/:hash', Dashboard.delete)

// 获取模板列表
router.get('/templates', Template.getAll)

router.get('/templates/:hash', Template.getConfig)

router.put('/templates/:hash', Template.update)

// 创建模板
router.post('/templates', Template.create)

// 获取大屏截图
router.get('/thumb/:hash', Thumbnail.getPNG)

export default app => {
  app.use('', router);
}
