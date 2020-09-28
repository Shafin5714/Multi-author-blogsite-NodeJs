const User = require('../models/User')
const Profile = require('../models/Profile')
const Post = require('../models/Post')
const bcrypt = require('bcryptjs')
const passport = require('passport')
const {isUserAuthenticated} = require('../middleware/custom')
// validation
const { validationResult } = require('express-validator')
const fs = require('fs')
const readingTime = require('reading-time')
const moment = require('moment')
const url = require('url')
const QRCode = require('qrcode')
const nodemailer = require('nodemailer');
require('dotenv').config()
// const {email,pass} =  require('../config/keys')



// subtract(-) form current date
function genDay(days){
    let date = moment().subtract(days,'days')
    console.log(date.toDate());
    return date.toDate()
    
}

// filter
function generateFilterObject(filter){
    filterObj = {}
    order= 1
    switch(filter){
        case 'week' :{
            filterObj ={
                createdAt:{
                    $gt:genDay(7)
                },            
            }
            order=-1
            break
        } 
        case 'month' :{
            filterObj ={
                createdAt:{
                    $gt:genDay(30)
                },            
            }
            order=-1
            break
        } 
        case 'all' :{
            order=-1
            break

        }
    }
    return { filterObj , order} 
}


// Dashboard
exports.index =async(req,res)=>{

    let filter = req.query.filter || 'latest'
    let { order, filterObj } = generateFilterObject(filter.toLowerCase())

    // pagination
    let currentPage = parseInt(req.query.page) || 1
    // console.log(currentPage);
    
    let itemPerPage = 6

    // let post = await Post.find().populate('author').sort({createdAt:-1})


    let post = await Post.find(filterObj).populate('author').sort(order === 1 ? 'createdAt' : '-createdAt').skip((itemPerPage * currentPage)- itemPerPage).limit(itemPerPage)

    // total number of post
    let totalPost = await Post.countDocuments()
    // console.log(totalPost);
    
    let totalPage  =  Math.ceil(totalPost / itemPerPage)
    // console.log(totalPage);

    let bookmarks = []
    if(req.user){
        let profile = await Profile.findOne({user:req.user._id})
        if(profile){
            bookmarks = profile.bookmarks
        }

    }
    
    // Count number of category post
    let total = await Post.aggregate([
        {
            $facet: {
              categories: [ // any name
                // Count the number of categories 
                {
                  $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                  }
                },
                // Sort by category name ascending
                { $sort: { count: -1, _id: 1 } }
              ]
            }
          }
       
      ])
    // console.log(total[0].categories);
    let ntotal = total[0].categories
    // console.log(ntotal);

    // Popular posts
    let popular = await Post.find().sort({likes:-1}).limit(3)
    // console.log(popular);
    
    

    res.render('pages/index',{user:req.user,post:post,moment:moment,filter,totalPage,itemPerPage,currentPage,bookmarks,ntotal,popular})
}

exports.userViewPostGetController = async(req,res,next)=>{
    try {
        let {postId} = req.params 
    // deep populate
    let post = await Post.findOne({_id:postId}).populate({
        path:'author',
        select:'username profileImage',
        populate:{
            path:'profile'
        }
    }).populate({
        path:'comments',
        populate:{
            path:'user',
            select:'username profileImage'
        }
    })
    .populate({
        path:'comments',
        // always populate collection
        populate:{
            path:'replies.user',
            select:'username profileImage'
        }
    })
    if(!post){
        let error = new Error('Post not found')
        error.status = 400
        return next(error)
    }
    let bookmarks = []
    if(req.user){
        let profile = await Profile.findOne({user:req.user._id})
        if(profile){
            bookmarks = profile.bookmarks
        }

    }


    // console.log(post);
    // console.log(url);
    var fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
    // console.log(fullUrl);
    
    // Generate QR code
     QRCode.toDataURL(fullUrl, function (err, url) {
        // console.log(url)
        res.render('pages/post-details',{user:req.user,post,moment,data:url,bookmarks})
      })
    
    // console.log(qr);
    // console.log(req.originalUrl);
    // if(post){
    //     res.render('pages/post-details',{user:req.user,post,moment,data:url})
    // }
    
   
    } catch (error) {
       next(error)
    }
   
}



// Creat Profile
exports.userCreateProfileGetController = async(req,res,next)=>{
    try {
        let profile =await Profile.findOne({user:req.user._id})
        if(profile){
            return res.redirect('/user/edit-profile')
        }else{
            res.render('pages/create-profile',{user:req.user})
        }
    } catch (error) {
       next(error);
    }
   
}


exports.userCreateProfilePostController = async(req,res,next)=>{
    let {name,title,bio,website,facebook,twitter,github} = req.body
    try{
    let profile = new Profile({
        user: req.user._id,
        name,
        title,
        bio,
        profileImage:req.user.profileImage,
        socialLinks: {
            website: website || '',
            facebook: facebook || '',
            twitter: twitter || '',
            github: github || ''
        },
        posts: [],
        bookmarks: []
    })
    let createdProfile = await profile.save()
    await User.findOneAndUpdate({
        _id: req.user._id
    }, {
        $set: {
            profile: createdProfile._id
        }
    })
   return res.redirect('/')
    }catch(error){
        next(error)
        
    }

}

// View profile redirect
exports.viewProfileRedirect = async(req,res,next)=>{
    try {
    let profileId = req.params.profileId
    if(!profileId){
        return res.redirect('/user/create-profile')
    }
    } catch (err) {
        next(err);
    }
    
    
    
}

// View Profile
exports.userViewProfileController = async(req,res,next)=>{
    try {
    let profileId = req.params.profileId
    console.log(profileId);
    let profile =await Profile.findOne({_id:profileId}).populate('posts')
    console.log(profile);
    
     if(!profile){
        return res.redirect('/user/profile')
     }else{
        res.render('pages/profile',{user:req.user,profile:profile,posts:profile.posts,moment})
         
         
     }
    } catch (error) {
        
        next(error);
        
    }
    
}





// Edit Profile
exports.userEditProfileGetController=async(req,res,next)=>{
    try {
        let profile = await Profile.findOne({
            user: req.user._id
        })
        if (!profile) {
            return res.redirect('/user/create-profile')
        }

        res.render('pages/edit-profile', {user:req.user, profile})

    } catch (error) {
        next(error);
    }
}
exports.userEditProfilePostController=async(req,res,next)=>{
   
        const { name,title,bio, website,facebook,twitter,github} = req.body
        let profile = {
            name,
            title,
            bio,
            socialLinks: {
                website: website || '',
                facebook: facebook || '',
                twitter: twitter || '',
                github: github || ''
            }
        }
        try{
            let updatedProfile =await Profile.findOneAndUpdate({user:req.user._id},
                { $set:profile},
                {new:true})
                // console.log(updateProfile);
                res.render('pages/edit-profile', {
                    profile: updatedProfile,user:req.user
                })
        }catch(error){
            next(error);
            
        }
       

     }
  

// Login
exports.userLoginGetController = (req,res)=>{
    
    res.render('pages/auth/login')
}


// Register
exports.userRegisterGetController = (req,res)=>{
    res.render('pages/auth/register')
}
exports.userRegisterPostController = async(req,res,next)=>{
    // console.log(req.body);
    const {username, email,password,password2} = req.body
    let errors= []
    // check for empty fields
    if (!username|| !password|| !password2|| !email){
        errors.push({msg:'Please fill in all the fields'})
    }
    // check password
    if(password!== password2){
        errors.push({msg:'Passwords don\'t match' })
    }
    // check password length
    if(password.length<6){
        errors.push({msg:'Password should be at least 6 characters'})
    }
    if(errors.length>0){
        // errors.map(err=>{
        //     console.log(err.msg);
            
        // })
        res.render('pages/auth/register',{
            errors,
            username:username,
            email:email,
            password:password,
            password2:password2
        })
       
        
    }else{
        try{
            let user = await User.findOne({email:email})
            if(user){
                errors.push({msg:"email already exists"})
                res.render('pages/auth/register',{
                    errors,
                    username:username,
                    email:email,
                    password:password,
                    password2:password2
                })
                
            }
            let uname = await User.findOne({username:username})
            if(uname){
                errors.push({msg:"username taken"})
                res.render('pages/auth/register',{
                    errors,
                    username:username,
                    email:email,
                    password:password,
                    password2:password2
                })
                
            }
            else{
                const newUser =new User({
                    username,
                    email,
                    password
                })
                // Hash password
                const salt = await bcrypt.genSalt(10)
                newUser.password = await bcrypt.hash(password,salt)
                 await newUser.save()
                 req.flash('success_msg','Successfully registered and can login')
                 res.redirect('/login')
                
            }
        }catch(error){
            next(error)
            
        }
        
    }


    // res.render('pages/auth/register',)
}


// Upload Profile Image
exports.uploadProfilePics =async (req,res)=>{
    if(req.file){
        try{
            let profile = await Profile.findOne({user:req.user._id})
            let profileImage = `/uploads/${req.file.filename}`
            if(profile){
                await Profile.findOneAndUpdate({
                    user:req.user._id
                },{$set:{profileImage}})
            }
            // console.log(profile);
            
            await User.findOneAndUpdate({_id:req.user.id},
               {$set:{profileImage}} )
            
               res.status(200).json({
                profileImage
               })
        }catch(e){
           res.status(500).json({
            profilePics:req.user.profileImage
           })
            
        }
    }else{
        res.status(500).json({
            profilePics:req.user.profileImage
           })
    }
}


// Remove Profile Image
exports.removeProfilePics = (req, res) => {
    try {
        let defaultProfile = '/uploads/default.png'
        let currentProfilePics = req.user.profileImage

        fs.unlink(`public${currentProfilePics}`, async (err) => {
            let profile = await Profile.findOne({
                user: req.user._id
            })
            if (profile) {
                await Profile.findOneAndUpdate({
                    user: req.user._id
                }, {
                    $set: {
                        profileImage: defaultProfile
                    }
                })
            }
            await User.findOneAndUpdate({
                _id: req.user._id
            }, {
                $set: {
                    profileImage: defaultProfile
                }
            })
        })
        res.status(200).json({
            profileImage: defaultProfile
        })

    } catch (e) {
        console.log(e)
        res.status(500).json({
            message: 'Can not Remove Profile Pics'
        })
    }
}


// Create Post
exports.userCreatePostGetController=(req,res)=>{

    res.render('pages/create-post',{user:req.user,error:{}})
}
exports.userCreatePostPostController = async(req,res,next)=>{
    
    let errors = validationResult(req)
     let {title, body, tags,category} = req.body
    //  console.log(req.body);
     
    //  console.log(title);
    //     console.log(req.body);
        
   let err =errors.array();
       err.map(e=>{
           console.log(e.msg);
           
       })
    let error = errors.mapped();
    // console.log(error);
    
    
    if(!errors.isEmpty()){
      return res.render('pages/create-post',{user:req.user,error:errors.mapped(),title:title,body:body,tags:tags})
    }
    if(tags){
        tags = tags.split(',')
        tags = tags.map(t=> t.trim())
    }
    // text value form body
    let readTime = readingTime(body).text
    let post = new Post({
        title,
        body,
        tags,
        category,
        author:req.user._id,
        thumbnail:'',
        readTime,
        likes:[],
        dislikes:[],
        comments:[]
    })
    if (req.file) {
        post.thumbnail = `/uploads/${req.file.filename}`
    }
    try{
       let createdPost = await post.save() 
       await Profile.findOneAndUpdate(
           {user:req.user._id},
           {$push:{'posts':createdPost._id}}
           )
        return res.redirect(`/user/posts/edit/${createdPost._id}`)
       }catch(error){
            next(error);
           
       }

}


// Edit Post
exports.userEditPostGetController = async(req,res)=>{
    let postId = req.params.id
    try{
        let post = await Post.findOne({author:req.user.id, _id:postId})
        if(post){
          return res.render('pages/edit-post',{user:req.user,error:{},post})
        }
     
    }catch(e){
        console.log(e);
        
    }   
    
}
exports.userEditPostPostController = async(req,res)=>{
  
    let errors = validationResult(req)
    let {title, body, tags} = req.body
    try{
        let postId = req.params.id
        let post = await Post.findOne({author:req.user.id, _id:postId})
        if(!errors.isEmpty()){
            res.render('pages/edit-post',{user:req.user,error:errors.mapped(),post})
        }
        if(tags){
            tags = tags.split(',')
            tags = tags.map(t=> t.trim())
        }
        // text value form body
        let thumbnail = post.thumbnail
        if (req.file) {
            fs.unlink(`public${post.thumbnail}`,(err)=>{
                if(err){
                    console.log(err);
                    
                }
            })
            thumbnail = `/uploads/${req.file.filename}`
        }
        await Post.findOneAndUpdate(
            { _id: post._id },
            { $set: { title, body, tags, thumbnail } },
            { new: true }
        )
        res.redirect('/')
         

    }catch(e){
        console.log(e);
        
    }   

}


// Post Image
exports.postImageUploadController=(req,res)=>{
    if(req.file){
       return res.status(200).json({
            imgUrl:`/uploads/${req.file.filename}`
        })
    }
    res.status(500).json({
        message
    })
}


// Delete post
exports.userDeletePostController =async (req,res)=>{
    let {postId} = req.params   
     try{
        let post = await Post.findOne({author:req.user.id,_id:postId})
        if(!post){
           return console.log('post not found')
        }
        fs.unlink(`public${post.thumbnail}`,(err)=>{
            if(err){
                console.log(err);
                
            }
        })
        await Post.findOneAndRemove({_id:postId})
        await Profile.findOneAndUpdate(
            {user:req.user._id},
            {$pull:{'posts':postId}}
        )
        res.redirect('/')

    }catch(e){
        console.log(e);
        
    }
}   
// Get all post
exports.getUserPostsController = async(req,res)=>{
 try {
     let posts = await Post.find({author:req.user._id})
     res.render('pages/userPosts',{user:req.user,posts})
     
 } catch (error) {
     console.log(e);
     
 }
}

// Change Password
exports.changePasswordGetController = (req,res)=>{
    res.render('pages/auth/changePassword',{user:req.user})
}
exports.changePasswordPostController = async (req,res)=>{

    let {oldPassword,newPassword,confirmPassword} = req.body
    if(newPassword!=confirmPassword){
        req.flash('error_msg','Password does not match')
        return res.redirect('/changePassword')
    }
    try{
        let matched = await bcrypt.compare(oldPassword,req.user.password)
        if(!matched){
         req.flash('error_msg','Invalid Old password')
        return res.redirect('/changePassword')
        }
        let hash = await bcrypt.hash(newPassword , 11)
        await User.findOneAndUpdate({_id:req.user._id},{$set:{password:hash}})
        req.flash('success_msg','Password Updated Successfully')
        return res.redirect('/changePassword')
    }catch(e){
        console.log(e);
        
    }
   



}

exports.contactMeController = (req,res)=>{
    res.render('pages/contact',{user:req.user})
}



exports.contactMePostController = (req,res)=>{
    
    const output = `
        <p>You have a new contact request form ${req.body.name}</p>
        <h3>Contact Details</h3>
        <ul>
        <li>Name: ${req.body.name}</li>
        <li>Email: ${req.body.email}</li>
        </ul>
        <h3>Message</h3>
        <p>${req.body.text}</p>
       
    `
    // console.log(email);
    // console.log(pass);
 
    let transporter = nodemailer.createTransport({
        host: "smtp.ethereal.email",
        port: 5000,
        secure: false,
        service: 'gmail',
        requireTLS: true,
        auth: {
          user: process.env.EMAIL,
          pass:  process.env.PASSWORD
        }
        
     });
      
      let mailOptions = {
        from: req.body.email,
        to: 'Shafin5714@outlook.com',
        subject: 'Contact Request',
        // text:"hello world",
        html:output
      };
      
      transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
        } else {
          console.log('Email sent: ' + info.response);
          req.flash('success_msg','Email Sent')
          res.redirect('/contact')
        
        }
      }); 

}

exports.categoryGetController  = async(req,res,next) =>{
    try{
        let categoryName = req.query.name        
        let category =await Post.find({category:categoryName}).populate({
            path:'author',
            select:'username profileImage'
        })
        // console.log(category);
        res.render("pages/category",{user:req.user, categoryName,category,moment})
    }catch(error){
        next(error)
        
    }
 

   
}

exports.aboutMeGetController = (req,res) =>{
    res.render('pages/about',{user:req.user})
}