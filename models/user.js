var mongoose = require('mongoose');

var Schema = mongoose.Schema;

var userSchema = new Schema({
	email : String,
	code  : String,
	token : String
});

module.exports = mongoose.model('user', userSchema);
