'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const dashboardSchema = new Schema({
    user: String,
    hash: String,
    name: String,
    description: String,
    width: Number,
    height: Number,
    imgUrl: String,
    thumbImgUrl: String,
    isTemplet: String,
    status: String,
    pubUrl: String,
    config: Object,
    timestamp: Number
})

export default mongoose.model('Dashboard', dashboardSchema);
