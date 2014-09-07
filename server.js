var express = require('express');
var bodyParser = require('body-parser');
var handler = require('./server/handler.js');
var updater = require('./server/autoUpdates.js');


updater.makeFile();

// var google = require('googleapis');
// var http = require('http');
// var fs = require('fs');
// var bigquery = new google.bigquery('v2');
// //Setup all of our authentication variables.
// //They are all grabbed from google developer console account website: 
// //https://console.developers.google.com/project/apps~agile-binder-688/apiui/credential?authuser=0
// var CLIENT_ID = "314338891317-a4n22257s5btge0qi4mev6vp99mepl9t.apps.googleusercontent.com";
// var CLIENT_SECRET = "_FW5deWK4e3fizF8n9VDi9j0";
// var datasetID = 'githubscout'
// var projectID = 'agile-binder-688'
// var SERVICE_ACCOUNT_EMAIL = '314338891317-u8v8evcg11jpfn8ukkdkbh25p53h84ua@developer.gserviceaccount.com'
// var SERVICE_ACCOUNT_KEY_FILE = './googleapi-privatekey.pem'//might be hidden
// var scopes = ['https://www.googleapis.com/auth/bigquery','https://www.googleapis.com/auth/cloud-platform'];

// //create an oauth2 object for authentication. We just need to add an access_token property now
// var oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'postmessage');

// //create a JWT object with our service account email and private key.
// var JWT = new google.auth.JWT(
// 	SERVICE_ACCOUNT_EMAIL,
// 	SERVICE_ACCOUNT_KEY_FILE,
// 	null,
// 	scopes);

// //use the JWT.authorize method to obtain an access token from googleAPI
// JWT.authorize(function(err,data){
// 	console.log('our access token: '+data.access_token)
// 	//set our oauth2 access token property
// 	oauth2.setCredentials({
// 		access_token: data.access_token
// 	});
// 	// console.log('does jobs.query exist: '+bigquery.jobs.query);
// 	// //attempts to create query job
// 	bigquery.jobs.insert({
// 		auth: oauth2,
// 		projectId: projectID,
// 		resource: {
// 			configuration: {
// 				query: {query: 'SELECT * FROM [githubscout.distinct_users_pushing_by_month_and_language] LIMIT 3500;'}
// 			}
// 		},
// 		media: {}
// 	}, function(err,data){
// 		if(err)console.log(err);
// 		var jobID = data['jobReference']['jobId'];
// 		bigquery.jobs.getQueryResults({
// 			auth: oauth2,
// 			jobId: jobID,
// 			projectId: projectID,
// 		},function(err,data){
// 			if(err){console.log(err)}
// 			fs.writeFile('usersPushingByMonthAndLanguage2.json',
// 				JSON.stringify(data),
// 				function(err){
// 					if(err)console.log(err);
// 					console.log('Saved!!!!!!!!!!')
// 				})
// 		});
// 	})
	
// 	//queries a specific table and saves the data to a json file
// 	// bigquery.tabledata.list({
// 	// 	auth:oauth2,
// 	// 	datasetId: datasetID,
// 	// 	projectId: projectID,
// 	// 	tableId: 'distinct_users_pushing_by_month_and_language',
// 	// 	},function(err,data){
// 	// 		if(err){console.log('insideAuthorize: '+err)};
// 	// 		fs.writeFile('usersPushingByMonthAndLanguage.json',
// 	// 			JSON.stringify(data),
// 	// 			function(err){
// 	// 				if(err)console.log(err);
// 	// 				console.log('saved!!!!!')
// 	// 			});
// 	// 	})	
// })



var app = express();
var port = port = process.env.PORT || 8000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static(__dirname + '/client'));


// .getUserCommitCountsByDate and .getUserCommitsByDateAndLanguage are deprecated.
// This functionality has been moved to the client.

// app.post('/api/user/commitcounts',function(req,res) {
//   console.log('POST /api/user/commitcounts');
//   handler.getUserCommitCountsByDate(req,res);
// });

// app.post('/api/user/commitsLanguage',function(req,res) {
//   console.log('POST /api/user/commitsLanguage');
//   handler.getUserCommitsByDateAndLanguage(req,res);
// });


//currently, this just serves up the contets of language_10_all.csv
app.post('/language',function(req,res){
	console.log('POST /language');
	handler.sendLanguageData(req,res);
});



var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});
