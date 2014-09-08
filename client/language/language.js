angular.module('githubscout.language', ['nvd3ChartDirectives',
 'ui.router'
 ])


  .controller('LanguageController', ['$scope', 'ChartsUtil', 'LanguageData', '$location', '$state', '$stateParams', function($scope, ChartsUtil, LanguageData, $location, $state, $stateParams){

    $scope.data = {};
    $scope.data.currentLanguages = LanguageData.currentLanguages;
    $scope.data.allLanguages = LanguageData.allLanguages;
    $scope.data.leaderboard = {};
    $scope.data.leaderboard.repos = LanguageData.leaderboard.repos;
    $scope.data.leaderboard.users = LanguageData.leaderboard.users;

    console.log('LanguageController')
    $scope.commits = LanguageData.commits;
    console.log("commmmmmits", $scope.commits)
    $scope.creates = LanguageData.creates;

    $scope.public_repos = LanguageData.public_repos;
    $scope.pushes = LanguageData.pushes;

    $scope.cleanUrl = function(url) {
      var i = url.lastIndexOf('com/');
      return url.slice(i+4,url.length);
    };

    // Formats the JavaScript date object for the x axis labels
    $scope.xAxisTickFormat = function(){
        return function(d){
            return d3.time.format('%x')(new Date(d));  //uncomment for date format
        };
    };

    $scope.addLanguage = function() {
      var settings = {};

      LanguageData.currentLanguages.push($scope.data.nextLanguage);

      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'activity',
        url: './data/language_activity_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
        LanguageData.commits = chartData;
        $state.transitionTo($state.current, $scope.data.nextLanguage, {
          location: true, reload: true, inherit: true, notify: true
        });
        // console.log($stateParams);
      });

      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'creates',
        url: './data/repo_creates_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
          LanguageData.creates = chartData;
          $state.transitionTo($state.current, $scope.data.nextLanguage, {
            location: true, reload: true, inherit: true, notify: true
          });
        });

      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'public_repos',
        url: './data/repos_made_public_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
          LanguageData.public_repos = chartData;
          $state.transitionTo($state.current, $scope.data.nextLanguage, {
            location: true, reload: true, inherit: true, notify: true
          });
        });

      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'pushes',
        url: './data/pushes_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
          LanguageData.pushes = chartData;
          $state.transitionTo($state.current, $scope.data.nextLanguage, {
            location: true, reload: true, inherit: true, notify: true
          });
        });


      }

  }])

