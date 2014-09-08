

var google = require('googleapis');
var http = require('http');
var fs = require('fs');
var bigquery = new google.bigquery('v2');

//Setup all of our authentication variables.
//They are all grabbed from google developer console account website: 
//https://console.developers.google.com/project/apps~agile-binder-688/apiui/credential?authuser=0

var CLIENT_ID = "314338891317-a4n22257s5btge0qi4mev6vp99mepl9t.apps.googleusercontent.com";
var CLIENT_SECRET = "_FW5deWK4e3fizF8n9VDi9j0";
var datasetID = 'githubscout'
var projectID = 'agile-binder-688'
var SERVICE_ACCOUNT_EMAIL = '314338891317-u8v8evcg11jpfn8ukkdkbh25p53h84ua@developer.gserviceaccount.com'
var SERVICE_ACCOUNT_KEY_FILE = './server/googleapi-privatekey.pem'
var scopes = ['https://www.googleapis.com/auth/bigquery','https://www.googleapis.com/auth/cloud-platform'];

var repo_activity_by_month_query = 'SELECT repository_language, LEFT(created_at, 7) as month, COUNT(*) as activity FROM [githubarchive:github.timeline] GROUP BY repository_language, month ORDER BY month DESC;'
var repo_activity_by_month_file = 'repo_activity_by_month.json'


//create an oauth2 object for authentication. We just need to add an access_token property now

var oauth2 = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, 'postmessage');

//create a JWT object with our service account email and private key.
var JWT = new google.auth.JWT(
	SERVICE_ACCOUNT_EMAIL,
	SERVICE_ACCOUNT_KEY_FILE,
	null,
	scopes);

var repo_activity_by_month = {
	query:'SELECT repository_language, LEFT(created_at, 7) as month, COUNT(*) as activity FROM [githubarchive:github.timeline] GROUP BY repository_language, month ORDER BY month DESC;',
	file: 'repo_activity_by_month.json'
}
var repos_creates_by_month = {
	query: "SELECT repository_language, LEFT(created_at, 7) as month, COUNT(*) as publics FROM [githubarchive:github.timeline] WHERE type='CreateEvent'GROUP BY repository_language, month ORDER BY month DESC;",
	file: "repos_creates_by_month.json"
}
var repos_made_public_by_month = {
	query:"SELECT repository_language, LEFT(created_at, 7) as month, COUNT(*) as publics FROM [githubarchive:github.timeline] WHERE type='PublicEvent'GROUP BY repository_language, month ORDER BY month DESC;",
	file:"repos_made_public_by_month.json"
}
var pushes_by_month = {
	query: "SELECT repository_language, LEFT(created_at, 7) as month, COUNT(*) as pushes FROM [githubarchive:github.timeline] WHERE type='PushEvent'GROUP BY repository_language, month ORDER BY month DESC;",
	file: "pushes_by_month.json"
}
var top_languages_by_activity_by_quarter = {
	query: "SELECT repository_language, CONCAT(LEFT(created_at, 7), '-01') as date, COUNT(*) as activity FROM [githubarchive:github.timeline] WHERE (type='PublicEvent' OR type='PushEvent' OR type='WatchEvent' OR type = 'PullRequestEvent'OR type = 'CreateEvent' or type ='IssuesEvent' or type ='ForkEvent') and repository_language is not null AND PARSE_UTC_USEC(created_at) >= PARSE_UTC_USEC('2012-01-01 00:00:00') AND PARSE_UTC_USEC(created_at) < PARSE_UTC_USEC('2012-04-01 00:00:00') GROUP BY repository_language, date ORDER BY date DESC, activity DESC LIMIT 10;",
	file: "top_languages_by_activity_by_quarter.json"
}
var all_languages_by_activity = {
	query: "SELECT repository_language, COUNT(*) as activity FROM [githubarchive:github.timeline] where (type='PublicEvent' OR type='PushEvent' OR type='WatchEvent' OR type = 'PullRequestEvent' OR type = 'CreateEvent' or type ='IssuesEvent' or type ='ForkEvent') GROUP EACH BY repository_language HAVING repository_language IS NOT NULL AND repository_language != ''ORDER BY activity DESC;",
	file: "all_languages_by_activity.json"
}
//set our export model
var updater = {};

var queries = [repo_activity_by_month,repos_creates_by_month,repos_made_public_by_month,pushes_by_month, top_languages_by_activity_by_quarter, all_languages_by_activity];

updater.masterUpdate = function() {
	if (queries.length > 0) {
		var query = queries.pop();
		setTimeout(function(){
			updater.makeFile(query.query,query.file,updater.masterUpdate);
		},5000);
	}
	queries = [repo_activity_by_month,repos_creates_by_month,repos_made_public_by_month,pushes_by_month, top_languages_by_activity_by_quarter, all_languages_by_activity]; 
};



//thequery: 'SELECT * FROM [githubscout.distinct_users_pushing_by_month_and_language] LIMIT 3500;'
//thefileName: 'usersPushingByMonthAndLanguage2.json'

updater.makeFile = function(myQuery,fileName,callback){

	// Use JWT.authorize to retrieve an access_token, add the access token to our oauth2 object,
	//and then use our oauth2 object to authenticate our bigquery API calls
		JWT.authorize(function(err,data){
			//set our oauth2 access token property
			console.log('inside JWT.authorize')
			console.log('access token: ',data.access_token)
			oauth2.setCredentials({
				access_token: data.access_token
			});
			//bigquery.jobs.insert takes a query and returns a promise that contains a jobId
			bigquery.jobs.insert({
				auth: oauth2,
				projectId: projectID,
				resource: {
					configuration: {
						query: {query: myQuery}
					}
				},
				media: {}
				//our callback takes the jobID we created and saves the results of that query
				//as a file
			}, function(err,data){
				console.log('data with jobID: ',data)
				if(err)console.log(err);
				var jobID = data['jobReference']['jobId'];
				bigquery.jobs.getQueryResults({
					auth: oauth2,
					jobId: jobID,
					projectId: projectID,
				},function(err,data){
					if(err){console.log(err)}
					fs.writeFile(fileName,
						JSON.stringify(data),
						function(err){
							if(err)console.log(err);
							console.log('Saved!!!!!!!!!!')
							callback();
						})
				});
			})	
		})		
}

// updater.makeFile(repo_activity_by_month_query,repo_activity_by_month_file);




module.exports = updater;
