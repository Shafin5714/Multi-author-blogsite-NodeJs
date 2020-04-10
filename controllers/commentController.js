const Post = require('../models/Post')
const Comment = require('../models/Comment')


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
       let cmt= await Comment.findOneAndUpdate(
            { _id: commentId },
            { $push: { 'replies': replay } }
        )
        console.log(cmt);
        // console.log(replay);

            
            
       return res.status(201).json({
        ...replay,
        profileImage: req.user.profileImage
        })


    } catch (e) {
        console.log(e)
        return res.status(500).json({
            error: 'Server Error Occurred'
        })
    }
}