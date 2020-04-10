const mongoose = require("mongoose");
const Schema = mongoose.Schema
const userSchema =new Schema({

 username:{
  type:String,
  // maxlength:10,
  // unique:true
  default:undefined
 },
  email: {
    type: String,
    // required: true,
    // unique: true,
    trim:true,
    lowercase: true,
    default:'no mail'
  },
  isAdmin:{
    type:Boolean,
    default:false
  },
  password: {
    type: String,
    // required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  googleid:{
    type:String,
    default:""
  },
  profile:{
    type:Schema.Types.ObjectId,
    ref:'profile'
  },
  profileImage:{
    type:String,
    default: '/uploads/default.png'
  }
  
});

const User = mongoose.model("user",userSchema);
module.exports = User;
