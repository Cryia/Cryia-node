'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const dashboardSchema = new Schema({
    hash: String,
    config: {
        page: Boolean,        
        title: String,
        about: String,
        width: Number,
        height: Number,
        zoom: Number,
        backgroundColor: String,
        backPic: String,
        timestamp: Number
    },
    widget: Array,
    publish: {
        hash: String,
        status: String,
        timestamp: Number
    },
    isTemplate: Boolean,
    level: Number,
    imgUrl: String,
    user: String,
    group: String,
    project: {type: String, default: ''},
    timestamp: Number
})

export const DashboardModel = mongoose.model('Dashboard', dashboardSchema)

export const TemplateModel = mongoose.model('Template', dashboardSchema)

export const PublishModel = mongoose.model('Publish', dashboardSchema)