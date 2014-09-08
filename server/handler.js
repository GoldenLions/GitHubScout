var bodyParser = require('body-parser');
var fs = require('fs');


var handler = {};

handler.sendTopUserStats = function(req,res){
  var language = req.body.language;
  fs.readFile('./server/leaderboard-data/userStats/top-user-stats-'+encodeURIComponent(language)+'.json',
    function(err,data){
    if(err) throw new Error(err);   
    res.set({
      'Content-Type': 'text/json'
    });
    res.send(data);
  });
};

handler.sendTopRepoStats = function(req,res){
  var language = req.body.language;
  fs.readFile('./server/leaderboard-data/repoStats/top-repo-stats-'+encodeURIComponent(language)+'.json',
    function(err,data){
    if(err) throw new Error(err);   
    res.set({
      'Content-Type': 'text/json'
    });
    res.send(data);
  });
};

// //currently this just serves up the contents of language_10_all.csv whenever
// //a POST request to '/language' is made
// handler.sendLanguageData = function(req,res){
//   fs.readFile('./client/CSVs/language_10_all.csv',function(err,data){
//     if(err) throw new Error(err);   
//     res.set({
//       'Content-Type': 'text/csv'
//     });
//     res.send(data);
//   });
// };

module.exports = handler;
