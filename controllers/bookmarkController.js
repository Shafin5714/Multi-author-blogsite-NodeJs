const Profile = require('../models/Profile')

exports.bookmarksGetController = async (req,res)=>{
    let { postId} = req.params
   
    if(!req.user){
      return res.status(403).json({
            error:'You are not an authenticated user'
        })
    }
    let userId = req.user._id
    let bookmark = null
    try{
        let profile = await Profile.findOne({user:userId})
        if(profile.bookmarks.includes(postId)){
            await Profile.findOneAndUpdate({user:userId},{$pull:{'bookmarks':postId}})
            bookmark = false
        }else{
            await Profile.findOneAndUpdate({user:userId},{$push:{'bookmarks':postId}})
            bookmark = true
        }
        res.status(200).json({
            bookmark
        })

    }catch(e){
        console.log(e);
        return res.status(500).json({
            error:'Server Error Occurred'
        })
        
    }
}

exports.getAllBookmarksByUser = async(req,res)=>{

    try {
        let profile = await Profile.findOne({user:req.user._id}).populate({path:'bookmarks',select:'title thumbnail'})
        console.log(profile);
        
        res.render('pages/bookmarks',{user:req.user,posts:profile.bookmarks})


        
    } catch (error) {
        console.log(error);
        
    }

}