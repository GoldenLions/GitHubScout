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

.factory('ChartsUtil', function(){

  var processLanguageData = function(settings, data){
    console.log('processLanguageData');

    var chartData = [];
    var values = [];

    for (var i=0; i < settings.languages.length; i++){
      language = settings.languages[i];
      console.log(language)

      // select the data for one language
      var filtered = data
        .filter(function(d){
           return d.repository_language ===language;
        });

      // Line charts require x and y values for every point.
      filtered
        .forEach(function(d){
          values.push([new Date(d.month), +d[settings.y]])
        });
        
      chartData.push({
        key: language,
        values: values
      });
    }
    return chartData;
  };

  return {
    processLanguageData: processLanguageData
  };
});

