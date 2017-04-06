var TelegramBot = require('node-telegram-bot-api');
var request = require('request');
var CronJob = require('cron').CronJob;
var MongoClient = require('mongodb').MongoClient;
var dbConfig = 'mongodb://dronich:15975300f@ds011321.mlab.com:11321/lentabot';
var cronn=0;

var job1 = new CronJob ('*/59 * * * * *', function() {
	MongoClient.connect(dbConfig, function(err, db){
		var stats = db.collection("stats");
		var collection = db.collection("users");
		var stat = null;
		stats.find().toArray(function(err, docs) {
			stat = docs[0];
			count = stat.count;
			for(var i=0;i<count;i++){		
				(function(i) {
					collection.find()
					.toArray(function(err, docs) {
						var user = docs[i];
						for(var j=1;j<=15;j++){
							(function(j) {										
								//console.log(i);
								if(user['id_m' + j]!=null){
									var URL = 'https://api.telegram.org/bot373098125:AAEDP31dxWwLxszbFamHh-DJrW_l7zE7Guk/forwardMessage?chat_id='+user.ChatID+'&from_chat_id='+user['uid' + j]+'&message_id='+user['id_m' + j];
									//console.log(URL);
									request(URL, function(error, response, body){
										var date = JSON.parse(body);

										if(date.ok === true){
											var id_mz= user['id_m' + j];
											collection.updateOne({ ChatID: user.ChatID }
												, { $set: { ['id_m' + j]: user['id_m' + j]+1
											} }, function(err, result) {
												console.log("Отправлено "+user.ChatID+user['id_m' + j]);
											});	

										}
										if(date.ok === false){
											console.log("Проверено "+user.ChatID+user['id_m' + j]);
											if(date.description === 'Bad Request: MESSAGE_ID_INVALID'){
												collection.updateOne({ ChatID: user.ChatID }
													, { $set: { ['id_m' + j]: user['id_m' + j]+1
												} }, function(err, result) {
													console.log("Ошибка "+user.ChatID+user['id_m' + j]);
												});
											}						
										}									
									});	
								}

							})(j);
						}
					});
				})(i);
			}	
		});	
		
	});		
});
if(cronn==0){
	job1.start();
	cronn++;		
}