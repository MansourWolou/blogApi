var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var articleSchema = new mongoose.Schema({
    name:{type:String , required:true},
    text: String, 
    like: {type:Boolean , default:false}, 
    publishDate: Date,
    comment : {type:mongoose.Schema.Types.ObjectId,ref:"comment"} 

});

module.exports = mongoose.model('article',articleSchema);
