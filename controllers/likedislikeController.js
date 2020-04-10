const Post = require("../models/Post");

exports.likesGetController = async (req, res) => {
  let { postId } = req.params;
 
  let liked = null
  if (!req.user) {
    res.status().json({
      error: "You are not an authenticated user"
    });
  }
  let userId = req.user._id
  try{
      let post =await Post.findById(postId)
      if(post.dislikes.includes(userId)){
          await Post.findOneAndUpdate({_id:postId},{$pull:{'dislikes':userId}})
         
      }
     
      if(post.likes.includes(userId)){
        await Post.findOneAndUpdate({_id:postId},{$pull:{'likes':userId}})
        liked = false
      }else{
        await Post.findOneAndUpdate({_id:postId},{$push:{'likes':userId}})
        liked = true
      }
      let updatedPost = await Post.findById(postId)
      res.status(200).json({liked:liked,
        totalLikes:updatedPost.likes.length,
        totalDisLikes:updatedPost.dislikes.length
    })

  }catch(err){
    console.log(err);
    res.status(500).json({
        error:'Internal server error'
    })
  }
};


exports.dislikesGetController = async(req,res)=>{
    let { postId } = req.params;
  
  let disliked = null
  if (!req.user) {
    res.status().json({
      error: "You are not an authenticated user"
    });
  }
  let userId = req.user._id
  try{
    let post =await Post.findById(postId)
    if(post.likes.includes(userId)){
        await Post.findOneAndUpdate({_id:postId},{$pull:{'likes':userId}})
       
    }
    if(post.dislikes.includes(userId)){
        await Post.findOneAndUpdate({_id:postId},{$pull:{'dislikes':userId}})
        disliked = false
    }else{
        await Post.findOneAndUpdate({_id:postId},{$push:{'dislikes':userId}})
        disliked = true
    }
    let updatedPost = await Post.findById(postId)
    res.status(200).json({disliked:disliked,
      totalLikes:updatedPost.likes.length,
      totalDisLikes:updatedPost.dislikes.length
    })
      

  }catch(err){
    res.status(500).json({
        error:'Internal server error'
    })
  }
}