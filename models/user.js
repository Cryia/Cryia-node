'use strict'

import mongoose from 'mongoose'

const Schema = mongoose.Schema

const userSchema = new Schema({
    username: String,
    password: String,
    email:String,
    phone:Number,
    create_time: String,
    roles:Array,
    projects: {type: Map, of: String},
    avatar: {type: String, default: 'default.jpg'},
    city: String,
})

userSchema.index({id: 1})

export default mongoose.model('User', userSchema)
