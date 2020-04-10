const mongoose = require('mongoose')

const Schema = mongoose.Schema

const CategorySchema = new Schema({
   title:{
    type:String,
    required:true
   }

})
const Category = mongoose.model('category',CategorySchema)
module.exports = Category