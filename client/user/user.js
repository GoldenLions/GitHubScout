angular.module('githubscout.search', [])

.controller('SearchController', ['$scope', '$state', '$stateParams', 'UserSearch', 'UserData', function ($scope, $state, $stateParams, UserSearch, UserData) {
  $scope.input = {};
  $scope.input.username= 'kwalker3690'
  // This function finds the data for a given username, which is stored at $scope.input.username. It stores the resulting data in the UserData service, then routes to the user state
  $scope.searchUser = function () {
    // First send a POST request to get the user's commit count data
    UserSearch.getUserCommitCount({username: $scope.input.username})
    .then(function (data) {
      UserData.rawDataCommitCount = data;

        // After receiving data for first POST request, send a second POST request to get the user's commit data by language
        UserSearch.getUserCommitsByLanguage({username: $scope.input.username})
        .then(function (data) {
          UserData.username = $scope.input.username;
          UserData.rawDataCommitsByLanguage = data;
          $stateParams.username = $scope.input.username;
          $state.go('user', $stateParams.username)
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

