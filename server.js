var express = require('express');
var bodyParser = require('body-parser');
var handler = require('./server/handler.js');

var app = express();
var port = port = process.env.PORT || 8000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/client'));

// TO DO: routes, API setup


// app.get('/',function(req,res) {
//   console.log('GET /');
// });

app.post('/api/user/commitcounts',function(req,res) {
  console.log('POST /api/user/commitcounts');
  handler.getUserCommitCountsByDate(req,res);
  /*responds with: 
  	res.JSON({
	  	results: [
	  		{date: ___, count: ____},
	  		{date: ___, count: ____},
	  		{date: ___, count: ____}, etc...
	  		]
  	})*/
});

app.post('/api/user/commitsLanguage',function(req,res) {
  console.log('POST /api/user/commitsLanguage');
  handler.getUserCommitsByDateAndLanguage(req,res);
});

//currently, this just serves up the contets of language_10_all.csv
app.post('/language',function(req,res){
	console.log('POST /language');
	handler.sendLanguageData(req,res);
});

var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});
