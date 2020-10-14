var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var commentSchema = new mongoose.Schema({
    commment: String, 
    commentDate:Date,
    likeComment: {type:Boolean , default:false}   

});

module.exports = mongoose.model('comment',commentSchema);
