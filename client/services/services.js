angular.module('githubscout.services', [])

.factory('UserSearch', function ($http, $stateParams, $state, getUserStats) {

	// Takes an object with a key of username that has a corresponding string, which is a username of a user on github. Returns an array of result JSON objects in the form of {date: 2013-03-13, count: 4}
	var getUserCommitCount = getUserStats


	// Takes an object with a key of username that has a corresponding string, which is a username of a user on github. Returns an array of result JSON objects in the form of {"date":"2013-05-14","languages":{"JavaScript":156871,"CSS":8123}, "repo":"portfolio"}
	var getUserCommitsByLanguage = getUserStats


	return {
		getUserCommitCount : getUserCommitCount,
		getUserCommitsByLanguage : getUserCommitsByLanguage
	}
})

.factory('UserData', function() {
	return {}
})
.factory('getUserStats', function($http) {
	var config = {
		client_key: 'bf7e0962f270bf033f78',
		client_secret: '37101e5bd7a17da01dfd4cb4f2889b8371b14388'
	};

	var iterativeGetRepoCommits = function(repo,author,storage,page) {
		var data = config;
		data.page = page;
		data.author = author;
		console.log('CURRENT COMMITS',repo.commits_url, page)
		return $http({
			'method': 'GET',
			'url': repo.commits_url,
			'data': data
		})
		.then(function(res) {
			console.log(res)
			_.each(res.data,function(item) {
				storage.push({
					'repo':repo.full_name,
					'date':item.commit.committer.date.slice(0,10)
				})
			});
			if (res.data.length === 30 && page < 5) {
				return iterativeGetRepoCommits(repo,author,storage,page+1);
			} else {
				console.log("Last page checked:",page)
				return storage;
			}
		})
	};

	var iterativeGetRepoStats = function(remainingRepoData,author,storage) {
		var repo = remainingRepoData.pop();
		console.log("CURRENT REPO", repo.full_name)
		var languages = {};
		return $http({
			'method': 'GET',
			'url': repo.languages_url,
			'data': config
		})
		.then(function(res) {
			console.log(res)
			languages = res.data;
			return iterativeGetRepoCommits(repo,author,[],1)
			.then(function(result) {
				console.log(result)
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

	var getUserStats = function(obj) {
		var author = obj.username;
		console.log(author)
		return $http({
			'method': 'GET',
			'url': 'https://api.github.com/users/'+author+'/repos',
			'data': config
		})
		.then(function(res) {
			var data = res.data;
			var repoData = _.map(data,function(repo) {
				return {
					'full_name':repo.full_name,
					'languages_url':repo.languages_url,
					'commits_url':repo.commits_url.slice(0,repo.commits_url.length-6)
				}
			});

			return iterativeGetRepoStats(repoData,author,[])
			.then(function(result) {
				return result.sort(function(a,b) {
					return a.date > b.date ? 1 : -1;
				})
			})
		});
	}

	return getUserStats;
})