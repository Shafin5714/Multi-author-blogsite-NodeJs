const mongoose = require('mongoose')
// const { MongoUri,Offline} = require('./keys')
require('dotenv').config()

let mongoUri = process.env.MONGO_URI
// console.log(mongoUri);

const connectDB = async() =>{
    try {
       await mongoose.connect(mongoUri,{
           useNewUrlParser: true,
           useUnifiedTopology: true,
           useCreateIndex:true,
           useFindAndModify:false
           
       });
       console.log('MongoDB connected..');
       
    } catch (error) {
        console.error(error.message);
        // Exit process with failure
        process.exit(1)
    }
}

module.exports = connectDB