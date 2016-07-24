var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var scheduleSchema = new Schema({
	color 	: String,
	ed_time : String,
	email 	: String,
	loc 	: String,
	explain : String,
	id 	: Number,
	st_time : String,
	title 	: String,
	weather : String
});

module.exports = mongoose.model('schedule',scheduleSchema);

