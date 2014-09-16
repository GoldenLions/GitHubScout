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
  // stores UserData.username and UserData.rawDataCommitsByLanguage for User controller
  return {}
})

.factory('UserDateandCommits',function(){
  // getdateandCommits will return an array of objects having the form ['2014-04-01',5],['2014-06-02',8]]
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
      var dt  = new Date(key)
      var year = dt.getFullYear()
      var month = dt.getMonth() + 1
      var seconds = year + "/" + month
      if(year===2014){
        result.push([seconds,commit[key]])
       }
    }
    return result
  }

  return {
    getdateandCommits: getdateandCommits
  }
})

//this factory will include the dates of second user if
//the first user didn't have those dates. This is necessary
//to compare series in the multibar chart
.factory('UserCompareRescaleBar', function(){
  var getCompareRescaleBar = function(userarray1,userarray2){
    var strip = []
    result = []
    for(var i =0; i<userarray1.length;i++){
      strip.push(userarray1[i][0])
    }

    for(var j = 0; j<userarray2.length; j++){
      if(strip.indexOf(userarray2[j][0])===-1){
        result.push([userarray2[j][0],0])
      }
    }

    var concatresult = userarray1.concat(result)
    var finalresult = concatresult.sort(function(a,b){

    if(parseInt((a[0].split('/')[1]))>parseInt((b[0].split('/')[1]))){
      return 1;
    }
    if(parseInt((a[0].split('/')[1]))<parseInt((b[0].split('/')[1]))){
      return -1
    }
    return 0
    })
    return finalresult;
  }
  return {
    getCompareRescaleBar: getCompareRescaleBar
  };

})

// getUserCommitsperLanganguage will return an array of objects having the form {language:'JavaScript', count:10}
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

// User info is pulled dynamically from the GitHub API in order to circumvent GitHub's IP limits.
.factory('getUserCommits', function($http) {
  // Our application credentials. Should use a token instead of hardcoding these in. Oh well.
  var config = [
    '?client_id=bf7e0962f270bf033f78',
    'client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
  ];

  // Gets commits by author for the current page of repo. Places the results in storage, and,
  // if there are remaining pages, recurses and increments page, upto 5 pages, i.e. up to
  // 500 commits for that repo. For some users this will be an underestimate. The GitHub API
  // permits up to 10 pages of results for 1000 commits, but we also have API limits to worry about.
  var iterativeGetRepoCommits = function(repo,author,storage,page) {
    // Copy config so as not to permanently push items.
    var data = config.slice(0);
    data.push('page='+page);
    data.push('author='+author);
    data.push('per_page=100')

    // Append data to the query URL.
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
      if (result.data.length === 100 && page < 6) {
        return iterativeGetRepoCommits(repo,author,storage,page+1);
      } else {
        return storage;
      }
    })
  };

  // For an array of repo objects, pops off a repo obj and first pulls the language spread
  // statistics from .languages_url before retrieving all commits by author for that repo.
  // Recurses until the array is empty.
  var iterativeGetRepoStats = function(remainingRepoData,author,storage) {
    var repo = remainingRepoData.pop();
   // console.log("CURRENT REPO", repo.full_name)
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

  // Gets up to 1000 of the user's repos and for each repo pulls out various statistics.
  // Sorts the final resulting array by date.
  var getUserCommits = function(obj) {
    console.log(obj)
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
  return getUserCommits;
})
// Query the GitHub API for up to 300 of the user's most recent events. This is currently
// unused on the user page, but could be used to implement a visual timeline.
.factory('getUserEvents', function($http) {
  var config = [
    '?client_id=bf7e0962f270bf033f78',
    'client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
  ];

  // The event object will include a payload object with many different properties. Each event
  // payload will have different properties depending on the event. Use this to parse it down
  // to only the relevant figures.
  var processPayload = function(payload,type) {
    return payload;
  };

  // The event object itself also has a lot of superfluous properties. Use this to parse it down
  // to what matters.
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

// Pulls up to 10 pages of 30 events each for the given username. This is the most the GitHub API
// will permit at once. It might be possible to wait a bit(?) before querying for pages 11-20, etc,
// but that has not been attempted.
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
    return fetchAllEvents(username,[],1);
  };

  return getUserEvents;
})

// Methods related to displaying the languages charts
.factory('ChartsUtil', function($q){

  //Since it can take a while for D3 to processs csv files, we use
  // $q promises to read the data file and return the results as a promise.
  var readDataFile = function(settings){
    // console.log('readDataFile', settings);

    // Create a promise object.
    var deferred = $q.defer();

    // d3.csv reads the csv files and returns the data
    d3.csv( settings.url, function(error, data){
      if(error) {
        console.log('d3 reading error');
        return error;
      }
      deferred.resolve(data);
    });

    return deferred.promise;
  };


  // The input rawData has information about all the languages.
  // processLanguageData() filters the raw data and  creates a
  // separate data set for each language that is listed in settings.

  // Reformats the rawData to create a line chart.
  // Returns a data set for one language as a promise.
  var processLanguageData = function(settings, rawData){
    // console.log('processLanguageData', settings);
    var chartData = [],
        values;

    // Create a promise object.
    var deferred = $q.defer();

    // Create one data set for each language listed in settings.
    for (var i=0; i < settings.languages.length; i++){
      values = [];
      language = settings.languages[i];

      // Filter out the data for one language.
      var filtered = rawData
        .filter(function(d){
          return d.repository_language ===language;
        });

      // Line charts require x and y values for every point.
      filtered
        .forEach(function(d){
          values.push([new Date(d.month), +d[settings.countType]]);
        });

      // Create a data set. Data set has a key and values.
      chartData.push({
        key: language,
        values: values
      });
    }

    deferred.resolve(chartData);
    return deferred.promise;
  };

  // Reads and processes a data file for the line charts on language page.
  // Returns the result as a promise.
  var fetchLanguageData = function(settings){
    // console.log('fecthLanguageData');

    var deferred = $q.defer();

    readDataFile(settings)
      .then(function(result){
        deferred.resolve( processLanguageData(settings, result) );
      });

    return deferred.promise;
  };

  // Reformats the rawData to create a horizontal bar chart.
  var processHorizontalBarData = function(settings, rawData){
    // console.log('processHorizontalBar', settings);
    var chartData =[],
      values =[];

    var deferred = $q.defer();

    rawData.forEach(function(d){
      values.push([d[settings.y], +d[settings.x]])
    });

    chartData =[{
        key: settings.key,
        values: values
      }];

    deferred.resolve(chartData);
    return deferred.promise;

  };

  // Reads and processes a data file for a horizontal  bar chart.
  // Returns the result as a promise.
  var fetchHorizontalBarData = function(settings){
    // console.log('fetchHorizontalBar');

    var deferred = $q.defer();

    readDataFile(settings)
      .then(function(result){
        deferred.resolve( processHorizontalBarData(settings, result) );
      });
    return deferred.promise;
  };

  // Reformats the rawData to create a stacked area chart.
  var processStackedAreaData = function(settings, rawData){
    // console.log('processStackedAreaData', settings);

    var chartData =[],
      values =[];

    var deferred = $q.defer();

    // Stacked area charts require the data be a nested array.
    // Create a nested array with repository language as the key.
    var results = d3.nest()
      .key(function(d){
        return d.repository_language;
      })
      .entries(rawData)
      .map(function(d){
        var group = d.key;
        var values = d.values.map(function(dd){
          return  [ Date.parse(dd.date), +dd[settings.countType]];
        });
        return {'key':group, 'values':values};
      });

    deferred.resolve(results);
    return deferred.promise;
  };

  // Reads and processes a data file for a stacked area chart.
  // Returns the result as a promise.
  var fetchStackedAreaData = function(settings){
    // console.log('fetchStackedAreaData');

    var deferred = $q.defer();

    readDataFile(settings)
      .then(function(result){
        deferred.resolve( processStackedAreaData(settings, result) );
      });
    return deferred.promise;
  };

  return {
    processLanguageData: processLanguageData,
    readDataFile: readDataFile,
    fetchLanguageData: fetchLanguageData,
    fetchStackedAreaData: fetchStackedAreaData,
    fetchHorizontalBarData: fetchHorizontalBarData
  };
})


.factory('LanguageData', function() {
  var allLanguages = ["ABAP", "AGS Script", "ANTLR", "APL", "ASP", "ATS", "ActionScript", "Ada", "Agda", "Alloy", "Apex", "AppleScript", "Arc", "Arduino", "AspectJ", "Assembly", "Augeas", "AutoHotkey", "AutoIt", "Awk", "BlitzBasic", "BlitzMax", "Bluespec", "Boo", "Brightscript", "Bro", "C", "C#", "C++", "CLIPS", "COBOL", "CSS", "Ceylon", "Chapel", "Cirru", "Clean", "Clojure", "CoffeeScript", "ColdFusion", "Common Lisp", "Component Pascal", "Coq", "Crystal", "Cuda", "D", "DCPU-16 ASM", "DCPU-16 Assembly", "DM", "DOT", "Dart", "Delphi", "Dogescript", "Dylan", "E", "Ecl", "Eiffel", "Elixir", "Elm", "Emacs Lisp", "EmberScript", "Erlang", "F#", "FLUX", "FORTRAN", "Factor", "Fancy", "Fantom", "Forth", "Frege", "GAMS", "GAP", "Game Maker Language", "Glyph", "Gnuplot", "Go", "Gosu", "Grace", "Grammatical Framework", "Groovy", "HaXe", "Harbour", "Haskell", "Haxe", "Hy", "IDL", "Idris", "Inform 7", "Io", "Ioke", "Isabelle", "J", "JSONiq", "Java", "JavaScript", "Julia", "KRL", "Kotlin", "LabVIEW", "Lasso", "LiveScript", "Logos", "Logtalk", "LookML", "Lua", "M", "Mathematica", "Matlab", "Max", "Max/MSP", "Mercury", "Mirah", "Modelica", "Monkey", "Moocode", "MoonScript", "Nemerle", "NetLogo", "Nimrod", "Nit", "Nix", "Nu", "OCaml", "Objective-C", "Objective-C++", "Objective-J", "Omgrofl", "Opa", "OpenEdge ABL", "OpenSCAD", "Ox", "Oxygene", "PAWN", "PHP", "Pan", "Parrot", "Pascal", "Perl", "Perl6", "PigLatin", "Pike", "PogoScript", "PowerShell", "Powershell", "Processing", "Prolog", "Propeller Spin", "Puppet", "Pure Data", "PureScript", "Python", "R", "REALbasic", "Racket", "Ragel in Ruby Host", "Rebol", "Red", "RobotFramework", "Rouge", "Ruby", "Rust", "SAS", "SQF", "SQL", "Scala", "Scheme", "Scilab", "Self", "Shell", "Shen", "Slash", "Smalltalk", "SourcePawn", "Squirrel", "Standard ML", "Stata", "SuperCollider", "Swift", "SystemVerilog", "TXL", "Tcl", "TeX", "Turing", "TypeScript", "UnrealScript", "VCL", "VHDL", "Vala", "Verilog", "VimL", "Visual Basic", "Volt", "XC", "XML", "XProc", "XQuery", "XSLT", "Xojo", "Xtend", "Zephir", "Zimpl", "eC", "nesC", "ooc", "wisp", "xBase" ];

  return {
    allLanguages: allLanguages,
    currentLanguages: [],
    leaderboard: {
      users: {},
      repos: {}
    }
  };
})


.factory('Map', function(){
  var showMap = function() {
    console.log('map factory')
        // Initialize a map with center and zoom level
    // var map = L.map('map').setView([33.7, -102.4],1);
    var map = L.map('map').setView([45, 0],1);

    // Tile layer contains the map information from Mapbox
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/wykhuh.jc1144hm/{z}/{x}/{y}.png',{
      maxZoom: 18
    }).addTo(map);



    // Sets color based on population density
    function getColor(d){
      return d > 100000000 ? '#800026' :
             d > 10000000  ? '#FC4E2A' :
                        '#FFEDA0';
    }

    // We use data from a GeoJSON file to draw the boundaries for each country.
    // Sets the style for GeoJSON layer.
    function style(feature){
      return {
        fillColor: getColor(feature.properties.pop_est),
        weight: 2,
        opacity: 1,
        color: '#777',
        dashArray: '1',
        fillOpacity: 0.5
      };
    }

    // Add GeoJSON layer to the map.
  }

  return {
    showMap: showMap
  }



})
