module.exports ={
    // Middleware to check if the user is authenticated
    isUserAuthenticated:(req, res, next)=> {
    if (req.user) {
        next();
    } else {
        res.redirect('/login');
    }
   
    },
isUserAdmin:(req,res,next)=>{
    if (req.user.isAdmin){
        next()
    }else{
        res.send('access denied')
    }
}

}