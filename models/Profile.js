const mongoose = require('mongoose')
const Schema = mongoose.Schema
const profileSchema =new Schema({
    user:{
        type:Schema.Types.ObjectId,
        ref:'user',
        required:true
    },
    name:{
        type:String
    },
    title:{
        type:String,
        trim:true,
        maxlength:100
    },
    bio:{
        type:String,
        trim:true,
        maxlength:500
    },
    profileImage:String,
    socialLinks:{
        website:String,
        facebook:String,
        twitter:String,
        instagram:String,
        github:String,
    },
    posts:[{type:Schema.Types.ObjectId,ref:'post'}],
    bookmarks:[
        {
            type:Schema.Types.ObjectId,
            ref:'post'
        }

    ]


},{timestamps:true})


const Profile = mongoose.model('profile',profileSchema)

module.exports = Profile