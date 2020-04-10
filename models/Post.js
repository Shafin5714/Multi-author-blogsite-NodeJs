const mongoose = require('mongoose')
const Schema = mongoose.Schema
const postSchema = new Schema({
    title:{
        type:String,
        required:true,
        maxlength:100
    },
    body:{
    type:String,
    required:true
    },
    author:{
        type:Schema.Types.ObjectId,
        ref:'user'
    },
    tags:{
        type:[String],
        requited:true
    },
    thumbnail:{
        type:String
    },
    readTime:{
        type:String
    },
    likes:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }],
    dislikes:[{
        type:Schema.Types.ObjectId,
        ref:'user'
    }],
    comments:[{
        type:Schema.Types.ObjectId,
        ref:'comment'
    }],
    category:{
       type:String
    }

    
},{timestamps:true})


const Post = mongoose.model('post',postSchema)
module.exports = Post