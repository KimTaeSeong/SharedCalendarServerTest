var express     = require('express');
var app         = express();
var path 		= require('path');
var favicon 	= require('serve-favicon');
var logger 		= require('morgan');
var cookieParser= require('cookie-parser');
var bodyParser  = require('body-parser');
//var session     = require('express-session);
var mongoose    = require('mongoose');
var Schedule	= require('./models/schedule');
var User		= require('./models/user');
 
app.set('views', './views');
app.set('view engine', 'ejs');
app.engine('html', require('ejs').renderFile);

// [CONFIGURE APP TO USE bodyParser]
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// [CONFIGURE SERVER PORT]
var port = process.env.PORT || 8080;
 
// [CONFIGURE ROUTER]
var router = require('./routes')(app, Schedule, User);


var db = mongoose.connection;
db.on('error', console.error);
db.once('open', function(){
	console.log("Connected to mongod server");
});

mongoose.connect('mongodb://localhost/db_calendar');

 
// [RUN SERVER]
var server = app.listen(port, function(){
 console.log("Express server has started on port " + port)
});
