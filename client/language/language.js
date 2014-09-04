angular.module('githubscout.language', ['nvd3ChartDirectives',
 'ui.router'
 ])

  //Since it can take a while for D3 to processs csv files, we use
  // $q to return a promise.
  .factory('Repos', ['$q', 'ChartsUtil', function($q, ChartsUtil){
    var url = './CSVs/repo_activity_by_month.csv';

    var settings = {
      languages: ['JavaScript', 'Ruby', 'Scala', 'CSS'],
      y: 'activity'
    };

    var dataDefer = $q.defer();
      // d3.csv reads the csv files and returns the data
      d3.csv( url, function(error, data){
      // processLanguageData() converts the data into the correct format for the charts
      dataDefer.resolve(ChartsUtil.processLanguageData(settings, data));
    });

    return dataDefer.promise;
  }])


  .controller('LanguageController', ['$scope', 'Repos', 'ChartsUtil', 'LanguageData', function($scope, Repos, ChartsUtil, LanguageData){

  	$scope.data = {}

    Repos.then(function(chartData){
      $scope.commits = chartData;
    });

    Repos.then(function(chartData){
      $scope.creates = chartData;
    });

    Repos.then(function(chartData){
      $scope.public_repos = chartData;
    });

    Repos.then(function(chartData){
      $scope.pushes = chartData;
    });


    // Formats the JavaScript date object for the x axis labels
    $scope.xAxisTickFormat = function(){
        return function(d){
            return d3.time.format('%x')(new Date(d));  //uncomment for date format
        };
    };

    // Sets the color for the lines
    var colorArray = ['#ffa500', '#c80032', '#0000ff', '#6464ff'];
    $scope.colorFunction = function(){
        return function(d, i){
            return colorArray[i];
        }
    }

  }])



