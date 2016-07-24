var push_service = require('../modules/push_service');
var crypto 	 = require('crypto');
//var InfiniteLoop = require('infinite-loop');
var schedule = require('node-schedule');
var rule = new schedule.RecurrenceRule();
//rule.minute = new schedule.Range(0,59,1);
rule.hour = 7;
rule.minute = 0;

module.exports = function(app, Schedule, User)
{
    // START PUSH SERVICE
    schedule.scheduleJob(rule, function(){
	push_service.listen(Schedule, User);
    });

    /////////////////////////////////////////* Web page *////////////////////////////////////
    app.get('/', function(req,res){
	res.render('index', {
			title: "he",
			length: 5
			})
	});
    app.get('/index.ejs', function(req,res){
	res.render('index', {
			title: "he",
			length: 5
			})
	});   
    app.get('/tables.ejs', function(req, res){
	User.find(function(err, users){
		if(err) return res.status(500).send({error: 'not found users'});
		res.render('tables',{
			users: users
		});
	})
    });
    /////////////////////////////////////////////////////////////////////////////////////////
    // GET ALL USER SCHEDULES
    app.get('/api/:email', function(req,res){
	Schedule.find(function(err, schedule){
        	if(err) return res.status(500).send({error: 'database failure'});
        	res.json(schedule);
	})	
    });
 
    // POST USER`S A SCHEDULE
    app.post('/api/:email', function(req, res){
	// 1. Save a schedule
	var schedule = new Schedule();
	schedule.title   = req.body.title;
	schedule.email   = req.body.email;
	schedule.loc     = req.body.loc;
	schedule.st_time = req.body.st_time;
	schedule.ed_time = req.body.ed_time;
	schedule.weather = req.body.weather;
	schedule.color   = req.body.color;
	schedule.id      = req.body.id;

	schedule.save(function(err){
		if(err){
			console.error(err);
			res.json({result: 0});
			return;
		}
		res.json({result: 1});
	});
        console.log("Req post a schedule");
    });
 
    // DELETE USER`S A SCHEDULE
    app.get('/api/del/:email/:id', function(req, res){
	console.log(req.params.email);
	console.log(req.params.id);
	// 1. Remove user`s a schedule
	Schedule.remove({$and:[{email: req.params.email},{id: Number(req.params.id)}]}, function(err, output){
		if(err) return res.status(500).json({error:"database failure"});

		console.log("Req del a schedule");
       		res.status(204).end();
    	})
    });

    // ENROLL A USER
    app.get('/api/:email/:token', function(req, res){
	// 1. 토큰과 메일주소가 일치하는 회원 확인
	User.findOne({$and: [{'email': req.params.email}, {'token': req.params.token}]} ,function(err, user){
                if(err) console.log("Fail to find user info!");
                if(user == null){
			// 2. 기존 회원이나 token값만 바뀐 경우 데이터 삭제
			User.remove({'email': req.params.email});			

			// 3. 새 유저 추가
                        var newUser = new User();
                        newUser.email = req.params.email;
                        newUser.code  = crypto.createHash('sha1').update(req.params.email).digest("hex");
                        newUser.token = req.params.token;
			newUser.save(function(save_err){
                                if(save_err){
					return res.status(500).json({error:"database failure"});
                                        console.log(save_err);
                                }
				res.status(204).end();
                        });
                } 
        });
    });
 
    // GET MY CODE
    app.get('/api/mycode/:email', function(req, res){
	console.log("Req my code");
        res.end();
    });
 
    // GET OTHER USER`S SCHEDULES
    app.get('/api/:code', function(req, res){
	console.log("Req other user`s schedules");
        res.end();
    });
}
