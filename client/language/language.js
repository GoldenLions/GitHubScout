angular.module('githubscout.language', ['nvd3ChartDirectives',
 'ui.router'
 ])


  .controller('LanguageController', ['$scope', 'ChartsUtil', 'LanguageData', '$location', '$state', '$stateParams', function($scope, ChartsUtil, LanguageData, $location, $state, $stateParams){

    $scope.data = LanguageData;

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

      //  Activity over Time chart
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
      });

      // Repos Created over Time chart
      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'creates',
        url: './data/language_creates_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
          LanguageData.creates = chartData;
          $state.transitionTo($state.current, $scope.data.nextLanguage, {
            location: true, reload: true, inherit: true, notify: true
          });
        });

      // Repos Made Public over Time chart
      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'public_repos',
        url: './data/language_made_public_by_month.csv'
      };

      ChartsUtil.fetchLanguageData(settings)
        .then(function(chartData){
          LanguageData.public_repos = chartData;
          $state.transitionTo($state.current, $scope.data.nextLanguage, {
            location: true, reload: true, inherit: true, notify: true
          });
        });

      // Pushes over Time chart
      settings = {
        languages: LanguageData.currentLanguages,
        countType: 'pushes',
        url: './data/language_pushes_by_month.csv'
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

