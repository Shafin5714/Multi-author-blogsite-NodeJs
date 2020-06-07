const express = require('express')
const router = express.Router()
const userController = require('../controllers/userController')
const passport = require('passport')
const passport_setup = require('../config/passport-setup')
const User = require('../models/User')
const {isUserAuthenticated} = require('../middleware/custom')
const upload = require('../middleware/uploadMiddleware')

// Comment Controller
const commentController = require('../controllers/commentController')
// LikesDisLikes Controller
const likesDislikeController = require('../controllers/likedislikeController')
// Bookmark Controller
const bookmarkController = require('../controllers/bookmarkController')
// validator
const postValidator = require('../validator/postValidator')
// Search Controller
const searchController = require('../controllers/searchController')






// Dashboard
router.route('/dashboard').get(userController.index)

// View post details
router.route('/dashboard/post/:postId').get(userController.userViewPostGetController)

// Profile Routes
router.route('/user/edit-profile').get(isUserAuthenticated,userController.userEditProfileGetController).post(userController.userEditProfilePostController)
router.route('/user/create-profile').get(isUserAuthenticated,userController.userCreateProfileGetController).post(userController.userCreateProfilePostController)

// view profile
router.route('/user/profile/:profileId').get(userController.userViewProfileController)


// Login Routes
router.route('/login').get(userController.userLoginGetController).post(passport.authenticate('local',{
    successRedirect:'/',
    failureRedirect:'/login',
    failureFlash:true,
    successFlash:true,
    session:true}))


//Register Route 
router.route('/register').get(userController.userRegisterGetController).post(userController.userRegisterPostController)
router.get('/user/logout',(req,res)=>{
    req.logout()
    req.flash('success_msg','logout was successful')
    res.redirect('/login')
})

// Change Password
router.route('/changePassword').get(isUserAuthenticated ,userController.changePasswordGetController).post(isUserAuthenticated, userController.changePasswordPostController)

// auth with google
router.get('/auth/google',passport.authenticate('google',{
    // scope =what to retrieve form users profile
    scope:['profile','email']
}))

// callback for google
router.get('/auth/google/redirect',passport.authenticate('google'),(req,res)=>{
    // res.send(req.user)  ///user provided by passport
    // console.log(user);
    if(!req.user.username){
        return res.redirect('/auth/extrainfo')
    }
    res.redirect('/')
})

// Get extraInfo
router.get('/auth/extrainfo',(req,res)=>{

    res.render('pages/auth/extrainfo',{user:req.user})
})
router.post('/auth/extrainfo/',async(req,res)=>{
    // console.log(req.user);
    // console.log(req.body.username);
    let id = req.user.id
    let uname =req.body.username
    try{
        let errors = []
         user = await User.findOne({_id:id})
        // console.log(user);
        let userCheck = await User.findOne({username:uname})
        if(userCheck){
            errors.push({msg:'username taken'})
           return res.render('pages/auth/extrainfo',{
             errors:errors
           })
            
        }
        if(user){
            user = await User.findOneAndUpdate({
                _id:req.user.id
            },{$set:{username:uname}},
            {new:true})


        }
    }catch(e){
        console.log(e);
        
    }
    
    res.redirect('/')
})

// Upload Image routes
router.post('/uploads/profilePics',isUserAuthenticated,upload.single('profilePics'),userController.uploadProfilePics)
router.post('/uploads/postimage', isUserAuthenticated, upload.single('post-image'), userController.postImageUploadController)
router.delete('/uploads/profilePics', isUserAuthenticated, userController.removeProfilePics)


// Create Post
router.route('/user/posts/create').get(isUserAuthenticated, userController.userCreatePostGetController)
.post(isUserAuthenticated,upload.single('post-thumbnail'),postValidator,userController.userCreatePostPostController)

// Edit Post
router.route('/user/posts/edit/:id').get(isUserAuthenticated, userController.userEditPostGetController).post(isUserAuthenticated,upload.single('post-thumbnail'),postValidator,userController.userEditPostPostController)


// Delete Post route
router.route('/user/posts/delete/:postId').get(isUserAuthenticated,userController.userDeletePostController)

// posts by user
router.route('/user/posts').get(isUserAuthenticated,userController.getUserPostsController)


// Comment routes
router.route('/user/comments/:postId').post(isUserAuthenticated,commentController.commentPostController)
router.route('/user/replies/:commentId').post(isUserAuthenticated, commentController.replayCommentPostController)

// Like/Dislike
router.route('/user/likes/:postId').get(isUserAuthenticated,likesDislikeController.likesGetController)
router.route('/user/dislikes/:postId').get(isUserAuthenticated,likesDislikeController.dislikesGetController)

// Bookmarks
router.route('/user/bookmark/:postId').get(isUserAuthenticated,bookmarkController.bookmarksGetController)

// All Bookmarks
router.route('/bookmarks').get(isUserAuthenticated, bookmarkController.getAllBookmarksByUser)

// All comments
router.route('/comments').get(isUserAuthenticated,commentController.getAllUserComments)

// Search route
router.route('/search').get(searchController.getSearchResult)


// Contact Me
router.route('/contact').get(userController.contactMeController).post(userController.contactMePostController)

router.get('/',(req,res)=>{
    res.redirect('/dashboard')
})

module.exports = router