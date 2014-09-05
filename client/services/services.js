angular.module('githubscout.services', [])

.factory('UserSearch', function ($http, $stateParams, $state, getUserCommits, getUserEvents) {
  // Takes an object with a key of username that has a corresponding string, which is a username of a user on github. Returns an array of result JSON objects in the form of {date: 2013-03-13, count: 4}
  var getUserCommitCount = getUserCommits
  // Takes an object with a key of username that has a corresponding string, which is a username of a user on github. Returns an array of result JSON objects in the form of {"date":"2013-05-14","languages":{"JavaScript":156871,"CSS":8123}, "repo":"portfolio"}
  var getUserCommitsByLanguage = getUserCommits

  return {
    getUserCommitCount : getUserCommitCount,
    getUserCommitsByLanguage : getUserCommitsByLanguage,
    getUserEvents: getUserEvents
  }
})

.factory('UserData', function() {
  return {}
})
 // getdateandCommits will return an array of object with 
 //object having the form ['2014-04-01',5],['2014-06-02',8]] 
.factory('UserDateandCommits',function(){
	var getdateandCommits  = function(obj){
    var result = []
    var commit = {};
    for(var i =0; i<obj.length; i++){
     var repo = obj[i]
      for(var key in repo){
          if(key === "date"){
             if(commit[repo[key]]){
                commit[repo[key]]++;
             }else{
                commit[repo[key]]=1;
             }
          }
      }
    }
    for(var key in commit){
    	var seconds = parseInt(new Date(key).getTime())
        result.push([seconds,commit[key]])
    }
    return result
  }

	return {
		getdateandCommits: getdateandCommits
	}
})

  // getUserCommitsperLanganguage will return an array of object with 
  //object having the form {language:'JavaScript', count:10}
.factory('UserLanguagesandCommits',function(){
    var getUserCommitsperLanganguage = function(obj){
      var result = []
      var commit ={}
      for(var i=0; i<obj.length;i++){
        var repo = obj[i].languages;
        for(var key in repo){
             if(commit[key]){
                commit[key]++
             }else{
               commit[key]=1
             }
         }
      }
      for(var key in commit){
      	   if(commit[key]<=3){
            result.push({language:key,count:commit[key]+3})
        }else{
            result.push({language:key,count:commit[key]})

        }
      }
      return result;
  }
  return {
  	 getUserCommitsperLanganguage: getUserCommitsperLanganguage
  }

})
.factory('getUserCommits', function($http) {
  var config = [
    '?client_id=bf7e0962f270bf033f78',
    'client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
  ];

  var iterativeGetRepoCommits = function(repo,author,storage,page) {
    var data = config.slice(0);
    data.push('page='+page);
    data.push('author='+author);
    data.push('per_page=100')
    //console.log('CURRENT COMMITS',repo.commits_url, page)
    return $http({
      'method': 'GET',
      'url': repo.commits_url+data.join('&')
    })
    .then(function(result) {
      _.each(result.data,function(item) {
        storage.push({
          'repo':repo.full_name,
          'date':item.commit.committer.date.slice(0,10)
        })
      });
      //console.log(result.data.length)
      if (result.data.length === 100 && page < 6) {
        return iterativeGetRepoCommits(repo,author,storage,page+1);
      } else {
        return storage;
      }
    })
  };

  var iterativeGetRepoStats = function(remainingRepoData,author,storage) {
    var repo = remainingRepoData.pop();
    //console.log("CURRENT REPO", repo.full_name)
    var languages = {};
    return $http({
      'method': 'GET',
      'url': repo.languages_url+config.join('&')
    })
    .then(function(result) {
      languages = result.data;
      return iterativeGetRepoCommits(repo,author,[],1)
      .then(function(result) {
        storage = storage.concat(_.map(result, function(commit) {
          commit.languages = languages;
          return commit;
        }));
        if (remainingRepoData.length > 0) {
          return iterativeGetRepoStats(remainingRepoData,author,storage);
        } else {
          return storage;
        }
      })
    })
  };

  var getUserCommits = function(obj) {
    var username = obj.username;
    return $http({
      'method': 'GET',
      'url': 'https://api.github.com/users/'+username+'/repos'+config.join('&')+'&per_page=1000'
    })
    .then(function(result) {
      var repoData = _.map(result.data,function(repo) {
        return {
          'full_name': repo.full_name,
          'languages_url': repo.languages_url,
          'commits_url': repo.commits_url.slice(0,repo.commits_url.length-6)
        }
      });

      return iterativeGetRepoStats(repoData,username,[])
      .then(function(result) {
        return result.sort(function(a,b) {
          return a.date > b.date ? -1 : 1;
        })
      })
    });
  }
      //console.log("this is getUserCOmmmits", getUserCommits)
  return getUserCommits;
})

.factory('getUserEvents', function($http) {
  var config = [
    '?client_id=bf7e0962f270bf033f78',
    'client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
  ];

  var processPayload = function(payload,type) {
    return payload;
  };

  var processEvent = function(event) {
    var result = {
      type: event.type,
      actor: event.actor.login,
      repo: event.repo.name,
      payload: processPayload(event.payload,event.type),
      date: event.created_at
    }
    return result;
  };

  var fetchAllEvents = function(username,storage,page) {
    var data = config.slice(0);
    data.push('page='+page);
    return $http({
      'method':'GET',
      'url':'https://api.github.com/users/'+username+'/events'+data.join('&')
    })
    .then(function(result) {
      storage = storage.concat(_.map(result.data, function(item) {
        return processEvent(item);
      }));
      if (result.data.length === 30 && page < 10) {
        return fetchAllEvents(username,storage,page+1)
      } else {
        return storage;
      }
    })
  };

  var getUserEvents = function(obj) {
    var username = obj.username;
    return fetchAllEvents(username,[],1)
  };

  return getUserEvents;
})

.factory('ChartsUtil', function($q){

  //Since it can take a while for D3 to processs csv files, we use
  // $q promises to read the data file and return the results. 
  readDataFile = function(settings){
    console.log('readDataFile', settings);

    // Create a promise object.
    var dataDefer = $q.defer();

      // d3.csv reads the csv files and returns the data
      d3.csv( settings.url, function(error, data){
        console.log(settings.url)
      // processLanguageData() converts the data into the correct format for the charts
      dataDefer.resolve(processLanguageData(settings, data));
    });
    
    return dataDefer.promise;
  };

  // The input data has information about all the languages.
  // processLanguageData() filters the data and  creates a 
  // separate data set for each language that is listed in settings.
  var processLanguageData = function(settings, data){
    console.log('processLanguageData', settings);

    var chartData = [],
        values;

    // Create one data set for each language in settings.
    for (var i=0; i < settings.languages.length; i++){
      values = [];
      language = settings.languages[i];

      // Select the data for one language.
      var filtered = data
        .filter(function(d){
           return d.repository_language ===language;
        });

      // Line charts require x and y values for every point.
      filtered
        .forEach(function(d){
          values.push([new Date(d.month), +d[settings.y]]);
        });
      
      // Create a data set. Data set has a key and values.
      chartData.push({
        key: language,
        values: values
      });
    }
    return chartData;
  };

  return {
    processLanguageData: processLanguageData,
    readDataFile: readDataFile
  };
})

// //Since it can take a while for D3 to processs csv files, we use
// // $q to return a promise.
// .factory('Repos', ['$q', 'ChartsUtil', 'LanguageData', function($q, ChartsUtil, LanguageData){
//   var makeRepoPromise = function() {
//     var url = './CSVs/repo_activity_by_month.csv';

//     var settings = {
//       languages: LanguageData.currentLanguages,
//       y: 'activity'
//     };

//     var dataDefer = $q.defer();
//       // d3.csv reads the csv files and returns the data
//       d3.csv( url, function(error, data){
//       // processLanguageData() converts the data into the correct format for the charts
//       console.log('d3 read')
//       dataDefer.resolve(ChartsUtil.processLanguageData(settings, data));
//     });

//     return dataDefer.promise
//   }

//   return {
//     makeRepoPromise: makeRepoPromise
//   }
// }])

.factory('LanguageData', function() {
  var allLanguages = ["ABAP", "AGS Script", "ANTLR", "APL", "ASP", "ATS", "ActionScript", "Ada", "Agda", "Alloy", "Apex", "AppleScript", "Arc", "Arduino", "AspectJ", "Assembly", "Augeas", "AutoHotkey", "AutoIt", "Awk", "BlitzBasic", "BlitzMax", "Bluespec", "Boo", "Brightscript", "Bro", "C", "C#", "C++", "CLIPS", "COBOL", "CSS", "Ceylon", "Chapel", "Cirru", "Clean", "Clojure", "CoffeeScript", "ColdFusion", "Common Lisp", "Component Pascal", "Coq", "Crystal", "Cuda", "D", "DCPU-16 ASM", "DCPU-16 Assembly", "DM", "DOT", "Dart", "Delphi", "Dogescript", "Dylan", "E", "Ecl", "Eiffel", "Elixir", "Elm", "Emacs Lisp", "EmberScript", "Erlang", "F#", "FLUX", "FORTRAN", "Factor", "Fancy", "Fantom", "Forth", "Frege", "GAMS", "GAP", "Game Maker Language", "Glyph", "Gnuplot", "Go", "Gosu", "Grace", "Grammatical Framework", "Groovy", "HaXe", "Harbour", "Haskell", "Haxe", "Hy", "IDL", "Idris", "Inform 7", "Io", "Ioke", "Isabelle", "J", "JSONiq", "Java", "JavaScript", "Julia", "KRL", "Kotlin", "LabVIEW", "Lasso", "LiveScript", "Logos", "Logtalk", "LookML", "Lua", "M", "Mathematica", "Matlab", "Max", "Max/MSP", "Mercury", "Mirah", "Modelica", "Monkey", "Moocode", "MoonScript", "Nemerle", "NetLogo", "Nimrod", "Nit", "Nix", "Nu", "OCaml", "Objective-C", "Objective-C++", "Objective-J", "Omgrofl", "Opa", "OpenEdge ABL", "OpenSCAD", "Ox", "Oxygene", "PAWN", "PHP", "Pan", "Parrot", "Pascal", "Perl", "Perl6", "PigLatin", "Pike", "PogoScript", "PowerShell", "Powershell", "Processing", "Prolog", "Propeller Spin", "Puppet", "Pure Data", "PureScript", "Python", "R", "REALbasic", "Racket", "Ragel in Ruby Host", "Rebol", "Red", "RobotFramework", "Rouge", "Ruby", "Rust", "SAS", "SQF", "SQL", "Scala", "Scheme", "Scilab", "Self", "Shell", "Shen", "Slash", "Smalltalk", "SourcePawn", "Squirrel", "Standard ML", "Stata", "SuperCollider", "Swift", "SystemVerilog", "TXL", "Tcl", "TeX", "Turing", "TypeScript", "UnrealScript", "VCL", "VHDL", "Vala", "Verilog", "VimL", "Visual Basic", "Volt", "XC", "XML", "XProc", "XQuery", "XSLT", "Xojo", "Xtend", "Zephir", "Zimpl", "eC", "nesC", "ooc", "wisp", "xBase", ]

  return {
    allLanguages: allLanguages,
    currentLanguages: []
  };
})
