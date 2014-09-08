angular.module('githubscout.search', [])

.controller('SearchController', ['$scope', '$state', '$stateParams', 'UserSearch',  'UserData', 'ChartsUtil', 'LanguageData', '$http', function ($scope, $state, $stateParams, UserSearch, UserData, ChartsUtil, LanguageData, $http) {
  $scope.loading = false;
  $scope.input = {};
  $scope.input.languageList = LanguageData.allLanguages
  // This function finds the data for a given username, which is stored at $scope.input.username. It stores the resulting data in the UserData service, then routes to the user state
  $scope.searchUser = function () {
    // First send a POST request to get the user's commit count data
 		$scope.loading = true;
    UserSearch.getUserCommitsByLanguage({username: $scope.input.username})
      .then(function (data) {
  			$scope.loading = false;
        UserData.username = $scope.input.username;
        UserData.rawDataCommitsByLanguage = data;
        $stateParams.username = $scope.input.username;
        $state.go('user', $stateParams.username)
      })
  };
  $scope.searchLanguage = function() {
    LanguageData.currentLanguages = [];
    LanguageData.currentLanguages.push($scope.input.language);

    if (!LanguageData.leaderboard.repos[$scope.input.language] || !LanguageData.leaderboard.users[$scope.input.language]) {    
      $http({
        method: 'POST',
        url: '/leaderboard/users',
        data: {language: $scope.input.language}
      })
      .then(function(result) {
        LanguageData.leaderboard.users[$scope.input.language] = result.data.sort(function(a,b) {
          return b.popular_repos_stars > a.popular_repos_stars ? 1 : -1;
        }).slice(0,20);
      });

      $http({
        method: 'POST',
        url: '/leaderboard/repos',
        data: {language: $scope.input.language}
      })
      .then(function(result) {
        LanguageData.leaderboard.repos[$scope.input.language] = result.data.sort(function(a,b) {
          return parseInt(b.stars.replace(/,/g,'')) > parseInt(a.stars.replace(/,/g,'')) ? 1 : -1;
      }).slice(0,20);
      });
    };


    var settings = {};

    settings = {
      languages: LanguageData.currentLanguages,
      countType: 'commits',
      url: './CSVs/repo_activity_by_month.csv'
    };

    ChartsUtil.fetchLanguageData(settings)
      .then(function(chartData){
      LanguageData.commits = chartData;

      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'creates',
        url: './CSVs/repo_creates_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
         LanguageData.creates = chartData;

        settings = {
          languages: LanguageData.currentLanguages,
          countType: 'public_repos',
          url: './CSVs/repos_made_public_by_month.csv'
        };

        ChartsUtil.fetchLanguageData(settings)
          .then(function(chartData){
            LanguageData.public_repos = chartData;


          settings = {
            languages: LanguageData.currentLanguages,
            countType: 'pushes',
            url: './CSVs/pushes_by_month.csv'
          };

          ChartsUtil.fetchLanguageData(settings)
            .then(function(chartData){
              LanguageData.pushes = chartData;
              $stateParams.language = $scope.input.language;
              $state.go('language', $stateParams.language)
            });
        });
      });
    });

}

}])

.directive('gsSearch', function () {
  return {
    restrict: 'A',
    templateUrl: 'search/search.html'
  }
})