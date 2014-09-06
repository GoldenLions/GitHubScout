angular.module('githubscout.home', ['nvd3ChartDirectives'])

.controller('HomeController', [ '$scope', 'ChartsUtil', function($scope, ChartsUtil){

  settings = {
    countType: 'activity',
    url: './CSVs/top_repo_by_activity_quarterly.csv'
  };

  ChartsUtil.fetchStackedAreaData(settings)
    .then(function(chartData){
      console.log('chartData', chartData)
      $scope.topLanguages  = chartData;
  });

  settings = {
    countType: 'commits',
    url: './CSVs/language_all_time1.csv',
    key: 'All Languages'
  };

  ChartsUtil.fetchHorizontalBarData(settings)
    .then(function(chartData){
      $scope.allLanguages  = chartData;
  });

  // Formats the JavaScript date object for the x axis labels
  $scope.xAxisTickFormat = function(){
      return function(d){
          return d3.time.format('%x')(new Date(d));  //uncomment for date format
      };
  };

}])