'use strict';

import mongoose from 'mongoose'

const Schema = mongoose.Schema;

const thumbSchema = new Schema({
    hash: String,
    image: String
})

export default mongoose.model('Thumbnail', thumbSchema);
