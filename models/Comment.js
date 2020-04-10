const mongoose = require('mongoose')
const Schema = mongoose.Schema
const commentSchema = new Schema({
    post:{
        type:Schema.Types.ObjectId,
        ref:'post',
        required:true,

    },
    user:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true,
    },
    body:{
        type:String,
        trim:true,
        required:true
    },
    replies:[
        {
            body:{
                type:String
            },
            user:{
                type:Schema.Types.ObjectId,
                ref:'user',
                required:true,
            },
            createdAt:{
                type:Date,
                default:new Date()
            }

           
        }
    ]

},{timestamp:true})

const Comment = mongoose.model('comment',commentSchema)
module.exports= Comment