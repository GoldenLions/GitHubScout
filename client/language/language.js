angular.module('githubscout.language', ['nvd3ChartDirectives',
 'ui.router'
 ])



  .controller('LanguageController', ['$scope', 'ChartsUtil', 'LanguageData', '$stateParams', function($scope, ChartsUtil, LanguageData, $stateParams){

  	$scope.data = {}

  	console.log('LanguageController')
    $scope.commits = LanguageData.commits;
    $scope.creates = LanguageData.creates;
    $scope.public_repos = LanguageData.public_repos;
    $scope.pushes = LanguageData.pushes;

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



