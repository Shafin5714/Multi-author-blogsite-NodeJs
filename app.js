const express = require('express')
const adminRoute = require('./routes/adminRoutes')
const userRoute = require('./routes/userRoutes')
const connectDB = require('./config/db')
const flash = require('connect-flash')
const passport = require('passport')
const session = require('express-session')
const bodyParser = require('body-parser')
const app = express()





// Passport config
require('./config/passport-setup')(passport) // returns a function then we have to call the function
// initialize middleware

// Setup View Engine
app.use(express.static(__dirname + '/public'));
app.set('view engine', 'ejs')

// connect Database
connectDB()



// flash and session
app.use(session({
    secret:'anysecret',
    saveUninitialized:true,
    resave:true
}))
// Passport middleware
app.use(passport.initialize());
app.use(passport.session());



// Connect flash
app.use(flash())

// Global vars
app.use((req,res,next)=>{
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    res.locals.error = req.flash('error')
    next()
})



// app.use(express.urlencoded({ extended:false }))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }))

app.use('/',userRoute)
app.use('/admin',adminRoute)

const PORT = process.env.PORT|| 5000


app.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}`);
    
})