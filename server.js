var express = require('express');
var bodyParser = require('body-parser');
var handler = require('./server/handler.js');
var updater = require('./server/autoUpdates.js');

//Takes two argument strings: MySQL query, and filename
updater.makeFile('SELECT * FROM [githubscout.distinct_users_pushing_by_month_and_language] LIMIT 3500;','usersPushingByMonthAndLanguage2.json');

var app = express();
var port = port = process.env.PORT || 8000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/client'));

app.post('/leaderboard/users',function(req,res) {
  console.log('POST /leaderboard/users');
  handler.sendTopUserStats(req,res);
});

app.post('/leaderboard/repos',function(req,res) {
  console.log('POST leaderboard/repos');
  handler.sendTopRepoStats(req,res);
});


//currently, this just serves up the contets of language_10_all.csv
app.post('/language',function(req,res){

	console.log('POST /language');
	handler.sendLanguageData(req,res);
});



var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});
