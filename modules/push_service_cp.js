var moment   = require('moment');
var http     = require('http');
var https    = require('https');
var request  = require('request');
var libxmljs = require('libxmljs');
var hashmap  = require('hashmap');
var sleep    = require('sleep');

var map = new hashmap();
map.set("맑음", "CLEAR");
map.set("구름많음", "CLOUD");
map.set("구름조금", "CLOUD");
map.set("흐림", "CLOUD");
map.set("눈/비", "SNOW");
map.set("눈", "SNOW");
map.set("흐리고 눈", "SNOW");
map.set("흐리고 눈/비", "SNOW");
map.set("구름많고 눈/비", "SNOW");
map.set("구름많고 눈", "SNOW");
map.set("구림 많고 비", "RAIN");
map.set("흐리고 비", "RAIN");
map.set("흐리고 비/눈", "RAIN");
map.set("구름많고 비/눈", "RAIN");
	
sendMessage = function(token, date, weather)
{
	var gcm = require('node-gcm');
	var fs = require('fs');
	var msgStr = moment(date, "YYYY-MM-DD").format("YYYY년 MM월 DD일") + "예상 날씨 : " + weather;
	var message = new gcm.Message();
	var message = new gcm.Message({
    		collapseKey: 'demo',
    		delayWhileIdle: true,
    		timeToLive: 3,
    		data: {
        		title: '날씨 경고',
        		message: msgStr,
        		custom_key1: 'custom data1',
        		custom_key2: 'custom data2'
    		}
	});

	//console.log(msgStr);
	//console.log(token);

	var server_api_key = 'AIzaSyDim0Xy5j9Lagqr_rZf7BvCX24LUPmcbDY';
	var sender = new gcm.Sender(server_api_key);
	var registrationIds = [];

	registrationIds.push(token);

	sender.send(message, registrationIds, 4, function (err, result) {
//    		console.log(result);
	});
}

// PUSH MESSAGE
pushMessage = function(Schedule, User, cityIdx, date, weather)
{
	if(Schedule != null){
//	console.log(cityIdx + " : " + date + " - " + weather + "-" + map.get(weather));
	var st_time = moment(date, "YYYY-MM-DD").format("MMM DD, YYYY 00:00:00 ") + "AM";
        var ed_time = moment(date, "YYYY-MM-DD").format("MMM DD, YYYY 23:59:59 ") + "PM";
	
        var weatherVal = map.get(weather);
	// 1. 현재 날짜에서 날씨가 일치하지 않으면 Push 
        return Schedule.find({$and:[{"st_time": {"$gte": st_time, "$lt": ed_time}}, {"weather": {$ne: weatherVal}}, {"weather":{ $ne: "NONE"}}, {"loc": {"$eq": cityIdx}}]}, function(err, schedules){
		var userMap = {};
		/*schedules.forEach(function(schedule) {
			//console.log(schedule.loc + ":" + schedule.weather);
			//console.log(schedule.email);
			User.findOne({"email": schedule.email}, function(err, user){
				if(user != null){
					//sendMessage(user.token, date, weather);
				}				
			});
		});*/
        });
	}
}

// LISTEN
exports.listen = function(Schedule, User)
{
	// 1. Set Url
	var hostAddr = "http://www.kma.go.kr";
	var basePath = "/weather/forecast/mid-term-rss3.jsp?stnId=";
	var locCodes = [];
	locCodes.push(109);
	locCodes.push(105);
	locCodes.push(131);		
	locCodes.push(133);
	locCodes.push(146);
	locCodes.push(156);
	locCodes.push(143);
	locCodes.push(159);
	locCodes.push(184);

	// 2. Iterate
	locCodes.forEach(function(locCode, idx){
		// 3. Request http message
		//console.log(hostAddr + basePath + locCode);
		request({
			uri: hostAddr + basePath + locCode,
			method: 'GET',
			headers: [{
				name: 'Content-Type',
				value: 'application/xml'
			}]}, 
			function(error, response, body){
				if(!error && response.statusCode == 200){
					var xmlDoc = libxmljs.parseXml(body);
					for (var i = 1; i <= 13; i+=2){
						if(i > 9) i--;
						var weather = xmlDoc.find('*/item/description/body/location/data/wf')[i].text();
						var date    = xmlDoc.find('*/item/description/body/location/data/tmEf')[i].text();
						pushMessage(Schedule, User, locCode, date, weather);
						break;
					}
				}
			});
	});
	// 4. Wait for 12 hours
	//var st_time = moment().format("MMM DD, YYYY 00:00:00 ") + "AM";
	//var ed_time = moment().format("MMM DD, YYYY 23:59:59 ") + "PM";
	console.log('start');
	sleep.sleep(3);
	//	console.log('check weathers');}, 43200);
}
