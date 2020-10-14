//bioModel.js
var mongoose = require('mongoose');
var Schema = mongoose.Schema;
//schema
var userSchema = new Schema({
    email: String,
    pass: String,
    isAdmin: Boolean,

});
module.exports = mongoose.model('user',userSchema);
//export user Model
//exports.user;

