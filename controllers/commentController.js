const Post = require('../models/Post')
const Comment = require('../models/Comment')
const Profile = require('../models/Profile')
const moment = require('moment')

exports.commentPostController = async(req,res)=>{
    let {postId} = req.params
    console.log(req.body);
    // console.log(JSON.stringify(req.body));
    // console.log(JSON.parse(req.body));
  
    let {body} = req.body
    // console.log(body);
    
    if(!req.user){
        res.status(403).json({
            error:'You are not an authenticated user'
        })
    }
//  console.log(body);


    let comment = new Comment({
        post:postId,
        user:req.user._id,
        body,
        replies:[]
    })
    try{
        let createdComment = await comment.save()
        await Post.findOneAndUpdate({_id:postId},{$push:{'comments':createdComment._id}})
    
        let commentJSON =await Comment.findById(createdComment._id).populate({
            path:'user',
            select:'profileImage username'
        })

        return  res.status(201).json(commentJSON) 
    }catch(e){
        console.log(e);

   
    }
    
}

exports.replayCommentPostController =async (req,res)=>{
    let {commentId} = req.params
    let { body} = req.body
    if(!req.user){
        res.status().json({
            error:'You are not an authenticated user'
        })
    }
   
    try {
        let replay = {
            body:body,
            user:req.user._id,
    
        }
       await Comment.findOneAndUpdate(
            { _id: commentId },
            { $push: { 'replies': replay } }
        )
        // console.log(replay);
        // let replayJSON = await Comment.findOne({_id:commentId}).populate({
        //         path:'replies.user',
        //         select:'username profileImage'
        // })
        // console.log(replayJSON.replies);

        
            
            
       return res.status(201).json({
        ...replay,
        profileImage: req.user.profileImage,
        username:req.user.username
        })


    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: 'Server Error Occurred'
        })
    }
}


// Get all user comments

exports.getAllUserComments = async(req,res)=>{
    try{
    let profile = await Profile.findOne({user:req.user._id})
    // when u have to work with lot of id (any of the id of the comment  )
    let comments = await Comment.find({post:{$in:profile.posts}}).populate({
        path:'post',
        select:'title'
    }).populate({
        path:'user',
        select:'username profileImage',
        populate:{  /// deep populate
            path:'profile',
            select:'_id'
        }
    }).populate({
        path:'replies.user',
        select:'username profileImage'
    })
    // res.json(comments)
    res.render('pages/comments',{user:req.user,comments,moment})
    }catch(e){
        console.log(e);
        
    }
}