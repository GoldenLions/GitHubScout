angular.module('githubscout.search', [])

.controller('SearchController', ['$scope', '$state', 'UserSearch', 'UserData', function ($scope, $state, UserSearch, UserData) {
	$scope.input = {};

	// This function finds the data for a given username, which is stored at $scope.input.username. It stores the resulting data in the UserData service, then routes to the user state
	$scope.searchUser = function () {
		// First send a POST request to get the user's commit count data
		UserSearch.getUserCommitCount({username: $scope.input.username})
			.then(function (data) {
				UserData.rawDataCommitCount = data;

				// After receiving data for first POST request, send a second POST request to get the user's commit data by language
				UserSearch.getUserCommitsByLanguage({username: $scope.input.username})
					.then(function (data) {
						UserData.rawDataCommitsByLanguage = data;
						$state.go('user')
					})
			})
	};


}])

.directive('gsSearch', function () {
	return {
		restrict: 'A',
		templateUrl: 'search/search.html'
	}
})