angular.module('githubscout.home', ['nvd3ChartDirectives', 'leaflet-directive'])

.controller('HomeController', [ '$scope', 'ChartsUtil', 'Map','$http', function($scope, ChartsUtil, Map, $http){

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
      $scope.allCountries  = chartData;
  });


  // Top 10 languages chart
  settings = {
    countType: 'activity',
    url: './data/home_top_language_by_activity_quarterly.csv'
  };

  ChartsUtil.fetchStackedAreaData(settings)
    .then(function(chartData){
      // console.log('Top languages', chartData);
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
    // console.log('all Languages', chartData)

      $scope.allLanguages  = chartData;
  });

  // Formats the JavaScript date object for the x axis labels
  $scope.xAxisTickFormat = function(){
      return function(d){
          return d3.time.format('%x')(new Date(d)); 
      };
  };



}])

/*

.directive('languageMap', function($window) {
  return {
    restrict: 'EA',
    template: '<div id="mapper" width="600" height="600"></div>',

    link: function(scope, elem, attrs) {
      // create a map in the "map" div, set the view to a given place and zoom
      var map = L.map('mapper').setView([51.505, -0.09], 13);

      // add an OpenStreetMap tile layer
      L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
      }).addTo(map);

      // add a marker in the given location, attach some popup content to it and open the popup
      L.marker([51.5, -0.09]).addTo(map)
          .bindPopup('A pretty CSS3 popup. <br> Easily customizable.')
          .openPopup();
    }
  }

})

*/
