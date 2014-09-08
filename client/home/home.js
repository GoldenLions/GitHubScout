angular.module('githubscout.home', ['nvd3ChartDirectives', 'leaflet-directive'])

//==================

      .controller("GeoJSONController", [ '$scope', '$http', function($scope, $http) {
        angular.extend($scope, {
            japan: {
                lat: 27.26,
                lng: 108.86,
                zoom: 3
            },
            defaults: {
                scrollWheelZoom: false
            }
        });

        // Get the countries geojson data from a JSON
        $http.get("json/JPN.geo.json").success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data,
                    style: {
                        fillColor: "green",
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    }
                }
            });
        });
      } ])
//==================


.controller('HomeController', [ '$scope', 'ChartsUtil',  '$http', function($scope, ChartsUtil, $http){

  // settings for language map
  angular.extend($scope, {
    center: {
      lat: 40.095,
      lng: -3.823,
      zoom: 2
    },
        // layers: {
        //     baselayers: {
        //         xyz: {
        //             name: 'OpenStreetMap (XYZ)',
        //             url: 'http://{s}.tiles.mapbox.com/v3/wykhuh.jc1144hm/{z}/{x}/{y}.png',
        //             type: 'xyz'
        //         }
        //     }
        // },
    defaults: {
      scrollWheelZoom: false
    },

  });


  $http.get("./assets/countries_d3.json").success(function(data, status) {
            angular.extend($scope, {
                geojson: {
                    data: data,
                    style: {
                        fillColor: "green",
                        weight: 2,
                        opacity: 1,
                        color: 'white',
                        dashArray: '3',
                        fillOpacity: 0.7
                    }
                }
            });
        });

  //=======================================

  // Top languages chart

  settings = {
    countType: 'activity',
    url: './CSVs/top_repo_by_activity_quarterly.csv'
  };

  ChartsUtil.fetchStackedAreaData(settings)
    .then(function(chartData){
      console.log('chartData', chartData);
      $scope.topLanguages  = chartData;
  });

  // All languages chart

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