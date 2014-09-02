angular.module('githubscout.services', [])

.factory('Search', function ($http, $stateParams, $state) {
	var submitUsername = function(data) {
		console.log(JSON.stringify(data))
		return $http({
			'method': 'POST',
			'url': '/api/user/commitcounts',
			'data': JSON.stringify(data)
		})
		.then(function(res) {
			console.log(res.data.results);
			return(res.data.results)
		});
	};

	return {
		submitUsername : submitUsername
	}
})