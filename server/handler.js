var Github = require('github');
var config = require('./config.js');
var bodyParser = require('body-parser');

var github = new Github({
  version: "3.0.0"
});

github.authenticate(config);

var handler = {};

handler.getUserCommitCountsByDate = function(req,res) {
  var username = req.body.username;
  github.repos.getFromUser({user: username},function(err,result) {
    var numRepos = result.length;
    var numCommits;
    var counts = {};
    var commits = [];
    for (var i = 0; i < numRepos; i++) {  
      (function (i) { 
        github.repos.getCommits({user:username,repo:result[i].name,author:username,per_page:100},function(err,result) {
          numCommits = result.length;
          var date;
          for (var j = 0; j < numCommits; j++) {
            date = result[j].commit.committer.date.slice(0,10);
            counts[date] = counts[date] || 0;
            counts[date]++;
          }
          if (i === (numRepos-2)) {
            var commit;
            for (var key in counts) {
              commit = {};
              commit.date = key;
              commit.count = counts[key];
              commits.push(commit);
            }
            commits = commits.sort(function(a,b){ return a.date > b.date ? 1 : -1});
            // res.json({results: commits});
            console.log(commits)
          }
        }); 
      })(i)
    }
  });
};

handler.getUserCommitsByDateAndLanguage = function(req,res) {
  var username = req.body.username;
  github.repos.getFromUser({user: username},function(err,result) {
    var numRepos = result.length;
    var numCommits;
    var commits = [];
    var processed = 0;
    for (var i = 0; i < numRepos; i++) {  
      (function (repoNum, repoName) { 
        github.repos.getLanguages({user:username,repo:repoName}, function(err,result) {
          delete result.meta;
          var languages = result;
          github.repos.getCommits({user:username,repo:repoName,author:username,per_page:100},function(err,result) {
            numCommits = result.length;
            var date;
            for (var j = 0; j < numCommits; j++) {
              date = result[j].commit.committer.date.slice(0,10);
              commits.push({date:date, languages:languages, repo:repoName});
            }
            processed++;
            if (processed === numRepos) {
              commits = commits.sort(function(a,b){ return a.date > b.date ? 1 : -1});
              // res.json({results: commits});
              console.log(commits)
            }
          }); 
        });
      })(i, result[i].name);
    }
  });
};

module.exports = handler;
