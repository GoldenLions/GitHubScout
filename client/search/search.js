angular.module('githubscout.search', [])

.controller('SearchController', ['$scope', '$state', '$stateParams', 'UserSearch',  'UserData', 'Repos', 'LanguageData', function ($scope, $state, $stateParams, UserSearch, UserData, Repos, LanguageData) {
	$scope.input = {};
	$scope.input.languageList = LanguageData.allLanguages
	// This function finds the data for a given username, which is stored at $scope.input.username. It stores the resulting data in the UserData service, then routes to the user state
	$scope.searchUser = function () {
		// First send a POST request to get the user's commit count data
		UserSearch.getUserCommitsByLanguage({username: $scope.input.username})
			.then(function (data) {
				UserData.username = $scope.input.username;
				UserData.rawDataCommitsByLanguage = data;
				$stateParams.username = $scope.input.username;
				$state.go('user', $stateParams.username)
			})
	};
	$scope.searchLanguage = function() {
		LanguageData.currentLanguages = [];
		LanguageData.currentLanguages.push($scope.input.language);

		var repoPromise = Repos.makeRepoPromise()
    repoPromise
	    .then(function(chartData){
	      LanguageData.commits = chartData;
	      LanguageData.creates = chartData;
	      LanguageData.public_repos = chartData;
	      LanguageData.pushes = chartData;
				$stateParams.language = $scope.input.language;
				$state.go('language', $stateParams.language)
	    });

	};

}])

.directive('gsSearch', function () {
	return {
		restrict: 'A',
		templateUrl: 'search/search.html'
	}
})