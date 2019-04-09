'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const tplSchema = new Schema({
    hash: String,
    name: String,
    resolution : String,
    config: Object,
    imgUrl: String,
    level: Number,
    author: String,
    timestamp: Number
})

tplSchema.index({id: 1});

export default mongoose.model('Template', tplSchema);
