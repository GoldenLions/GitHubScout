angular.module('githubscout.home', ['nvd3ChartDirectives'])

.controller('HomeController', [ '$scope', 'ChartsUtil', function($scope, ChartsUtil){

  settings = {
    countType: 'commits',
    url: './CSVs/language_all_time1.csv',
    key: 'All Languages'
  };

  ChartsUtil.fetchHorizontalBarData(settings)
    .then(function(chartData){
      console.log('chartData', chartData);
      $scope.allLanguages  = chartData;

  });



  // // Formats the JavaScript date object for the x axis labels
  $scope.xAxisTickFormat = function(){
      return function(d){
          return d3.time.format('%x')(new Date(d));  //uncomment for date format
      };
  };

  $scope.barHeight = function(){
    return function(d,i){
      return (i *10 +'px');
    }
  }

}])