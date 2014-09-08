angular.module('githubscout.home', ['nvd3ChartDirectives', 'leaflet-directive'])

.controller('HomeController', [ '$scope', 'ChartsUtil',  '$http', function($scope, ChartsUtil, $http){

  // Top countries chart
 settings = {
    countType: 'events',
    url: './data/home_top_countries_by_activity.csv',
    key: 'All Countries',
    x: 'events',
    y: 'country'
  };

    ChartsUtil.fetchHorizontalBarData(settings)
    .then(function(chartData){
      console.log('chhhhh', chartData)
      $scope.allCountries  = chartData;
  });


  // Top 10 languages chart
  settings = {
    countType: 'activity',
    url: './data/home_top_language_by_activity_quarterly.csv'
  };

  ChartsUtil.fetchStackedAreaData(settings)
    .then(function(chartData){
      console.log('Top languages', chartData);
      $scope.topLanguages  = chartData;
  });

  // All languages chart
  settings = {
    countType: 'commits',
    url: './data/home_all_languages.csv',
    key: 'All Languages',
    x: 'commits',
    y: 'repository_language'
  };

  ChartsUtil.fetchHorizontalBarData(settings)
    .then(function(chartData){
    console.log('all Languages', chartData)

      $scope.allLanguages  = chartData;
  });

  // Formats the JavaScript date object for the x axis labels
  $scope.xAxisTickFormat = function(){
      return function(d){
          return d3.time.format('%x')(new Date(d)); 
      };
  };

}])