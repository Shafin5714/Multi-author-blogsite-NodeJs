var passport = require('passport')
  , LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs')
const GoogleStrategy = require('passport-google-oauth20')
// const keys = require('./keys')
require('dotenv').config()
const User = require("../models/User");
// passport parameter will be passed in form app.js
module.exports = function(passport) {
  passport.use(
    // we are not using an username so we want to use email as our username
    new LocalStrategy({ usernameField: "email" }, (email, password, done) => {
      // Match User
      // one form database and one form usernameField:'email'
      User.findOne({ email: email })
        .then(user => {
          // its going to give us user or null
          if (!user) {
            return done(null, false, {
              message: "That email is not registered"
            });
          }
          // Match password
          bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err) throw err;

            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, { message: "Password incorrect" });
            }
          });
        })
        .catch(err => console.log(err));
    })
  );
  passport.use(
    new GoogleStrategy({
    // options for google start
    callbackURL:'/auth/google/redirect',
    clientID:process.env.CLIENT_ID,
    clientSecret:process.env.CLIENT_SECRET

},(accessToken,refreshToken,profile,done)=>{
    //passport callback function
    // console.log(accessToken);
    // console.log(refreshToken);
    
    // console.log(profile);
    // console.log(profile.emails[0].value);
    
    // console.log(profile.photos[0].value);
    
    // check if the user already exist
    User.findOne({googleid:profile.id}).then((currentUser)=>{
        if(currentUser){
            // already have user
            console.log('user is ',currentUser);
            done(null,currentUser)  ///null as error //done means go to the next stage means go to serializer
            
        }else{
            // if not create user in our db
            new User({
                // name:profile.displayName,
                googleid:profile.id,
                email:profile.emails[0].value
                // thumbnail:profile.photos[0].value
            }).save().then((newUser)=>{
                console.log('new user created'+newUser);
                done(null,newUser)  ///null as error
            })
        }
    })
   
    
})
)
  passport.serializeUser(function(user, done) {
    done(null, user.id);
  });

  passport.deserializeUser(function(id, done) {
    User.findById(id, function(err, user) {
      done(err, user);
    });
  });
};
