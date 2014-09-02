var Github = require('github');
var config = require('./config.js');
var bodyParser = require('body-parser');

var github = new Github({
  version: "3.0.0"
});

github.authenticate(config);

var handler = {};

//This is called by server.js as a request handler for
//post requests to url: /api/user/commitcounts

handler.getUserCommitCountsByDate = function(req,res) {
  //grab username from post request
  var username = req.body.username;
  //makes a github API call that results in an array of all
  //repos for a given user, and then invokes a callback on the result 
  github.repos.getFromUser({user: username},function(err,result) {
    //define number of repos
    var numRepos = result.length;
    var numCommits;
    var counts = {};
    var commits = [];
    //for every repo, do the following:
    for (var i = 0; i < numRepos; i++) {
      //lock repoNum into closure scope using an immediately invoked function  
      (function (repoNum) {
        //grab every commit in the given repo 
        github.repos.getCommits({user:username,repo:result[repoNum].name,author:username,per_page:100},function(err,result) {
          //define the number of commits
          numCommits = result.length;
          var date;
          //for ever commit in the given repo:
          for (var j = 0; j < numCommits; j++) {
            //grab the date of the commit
            date = result[j].commit.committer.date.slice(0,10);
            //store the date as a key:value pair in the counts object,
            //where the key is the date and the value is the commit count
            //if the date already exists, increment the count by 1, 
            counts[date] = counts[date] || 0;
            counts[date]++;
          }
          //after every repo has been iterated over:
          if (repoNum === (numRepos-2)) {
            var commit;
            //iterate over counts, and make a commit object for each date 
            //that looks like this: {date: ___, count: ____}
            //then push each commit object into the commits array
            for (var key in counts) {
              commit = {};
              commit.date = key;
              commit.count = counts[key];
              commits.push(commit);
            }
            //sort the commits array by date, wrap it in JSON and respond to client
            commits = commits.sort(function(a,b){ return a.date > b.date ? 1 : -1});
            res.json({results: commits});
            // console.log(commits)
          }
        }); 
      })(i)
    }
  });
};

//This is called by server.js as a request handler for
//post requests to url: /api/user/commitsLanguage
//It responds to the client with a JSON array containing every commit 
//a given user has ever made. Each commit is represented by 
//an object that looks like this: {date:____, languages:____, repo:_____}

handler.getUserCommitsByDateAndLanguage = function(req,res) {

  //grab username from post request

  var username = req.body.username;

  //makes a github API call that results in an array of all
  //repos for a given user, and then invokes a callback on the result 

  github.repos.getFromUser({user: username},function(err,result) {
    
    //define number of repos 
    
    var numRepos = result.length;
    var numCommits;

    //define a commits storage array, which we will later populate with
    //every commit the user has ever made

    var commits = [];
    var processed = 0;

    //For every repo, do the following:

    for (var i = 0; i < numRepos; i++) {

      //use immediately invoked function to lock repoNum and repoName into 
      //closure scopes so that Async API calls within the for loop will refer
      //to the correct repos

      (function (repoNum, repoName) { 

        //grab every language in the repo from githubAPI,
        //and store the results in var languages

        github.repos.getLanguages({user:username,repo:repoName}, function(err,result) {
          delete result.meta;
          var languages = result;

          //after the languages have been pulled from githubAPI, grab every single
          //commit the user has made for the given repo, and store each one as an
          //object in the commits array with date, language, and repoName properties. 

          github.repos.getCommits({user:username,repo:repoName,author:username,per_page:100},function(err,result) {
            numCommits = result.length;
            var date;
            for (var j = 0; j < numCommits; j++) {
              date = result[j].commit.committer.date.slice(0,10);
              commits.push({date:date, languages:languages, repo:repoName});
            }
            //after the for loop finishes, our commits array will have an 
            //object for every commit the user has made for one given repo. Then, we 
            //go back up to the top for loop, and repeat the process for the next repo.

            //Only after every repo has been added to the commits array, we sort
            //the array, wrap it in JSON, and respond back to the client. 

            processed++;
            if (processed === numRepos) {
              commits = commits.sort(function(a,b){ return a.date > b.date ? 1 : -1});
              res.json({results: commits});
              // console.log(commits)
            }
          }); 
        });
      })(i, result[i].name);
    }
  });
};

// github.events.getFromUser({user:'browles'},function(err,result) {
//   console.log(result);
// });

module.exports = handler;
