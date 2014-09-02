angular.module('githubscout.services', [])

.factory('UserSearch', function ($http, $stateParams, $state) {

	// Takes an object with a key of username that has a corresponding string, which is a username of a user on github. Returns an array of result JSON objects in the form of {date: 2013-03-13, count: 4}
	var getUserCommitCount = function(usernameObj) {
		console.log(JSON.stringify(usernameObj))
		return $http({
			'method': 'POST',
			'url': '/api/user/commitcounts',
			'data': JSON.stringify(usernameObj)
		})
		.then(function(res) {
			return(res.data.results)
		});
	};

	// Takes an object with a key of username that has a corresponding string, which is a username of a user on github. Returns an array of result JSON objects in the form of {"date":"2013-05-14","languages":{"JavaScript":156871,"CSS":8123}, "repo":"portfolio"}
	var getUserCommitsByLanguage = function(usernameObj) {
		console.log(JSON.stringify(usernameObj))
		return $http({
			'method': 'POST',
			'url': '/api/user/commitsLanguage',
			'data': JSON.stringify(usernameObj)
		})
		.then(function(res) {
			return(res.data.results)
		});
	}

	return {
		getUserCommitCount : getUserCommitCount,
		getUserCommitsByLanguage : getUserCommitsByLanguage
	}
})

.factory('UserData', function() {
	return {}
})