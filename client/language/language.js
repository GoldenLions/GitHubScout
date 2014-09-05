angular.module('githubscout.language', ['nvd3ChartDirectives', 'ui.router'])

// <<<<<<< HEAD


//   .controller('LanguageController', ['$scope', 'ChartsUtil', 'LanguageData', 'Repos', '$location', '$state', '$stateParams', function($scope, ChartsUtil, LanguageData, Repos, $location, $state, $stateParams){

//   	$scope.data = {}
//   	$scope.data.currentLanguages = LanguageData.currentLanguages;
//   	$scope.data.allLanguages = LanguageData.allLanguages;

//   	console.log('LanguageController')
//     $scope.commits = LanguageData.commits;
//     $scope.creates = LanguageData.creates;
//     $scope.public_repos = LanguageData.public_repos;
//     $scope.pushes = LanguageData.pushes;
// =======
  .controller('LanguageController', ['$scope', '$q', 'ChartsUtil', function($scope, $q, ChartsUtil){
    var settings = {};

    settings = {
      languages: ['JavaScript', 'Ruby', 'Scala', 'CSS'],
      y: 'activity',
      url: './CSVs/repo_activity_by_month.csv'
    };
    
    ChartsUtil.readDataFile(settings).then(function(chartDataRepo){
      $scope.commits = chartDataRepo;
    });

    settings = {
      languages: ['JavaScript', 'Ruby', 'Scala', 'CSS'],
      y: 'creates',
      url: './CSVs/repo_creates_by_month.csv'
    };

    ChartsUtil.readDataFile(settings).then(function(chartDataRepo){
      $scope.creates = chartDataRepo;
    });

    settings = {
      languages: ['JavaScript', 'Ruby', 'Scala', 'CSS'],
      y: 'publics',
      url: './CSVs/repos_made_public_by_month.csv'
    };

    ChartsUtil.readDataFile(settings).then(function(chartDataRepo){
      $scope.public_repos = chartDataRepo;
    });

    settings = {
      languages: ['JavaScript', 'Ruby', 'Scala', 'CSS'],
      y: 'pushes',
      url: './CSVs/pushes_by_month.csv'
    };

    ChartsUtil.readDataFile(settings).then(function(chartDataRepo){
      $scope.pushes = chartDataRepo;
    });
// >>>>>>> (feat/languagePage) Refactor the code for the language charts. Move functions to services.js

    // Formats the JavaScript date object for the x axis labels 
    $scope.xAxisTickFormat = function(){
        return function(d){
            return d3.time.format('%x')(new Date(d));
        };
    };

// <<<<<<< HEAD
//     // Sets the color for the lines
//     var colorArray = ['#ffa500', '#c80032', '#0000ff', '#6464ff'];
//     $scope.colorFunction = function(){
//         return function(d, i){
//             return colorArray[i];
//         }
//     }

    $scope.addLanguage = function() {
    	LanguageData.currentLanguages.push($scope.data.nextLanguage);

			var repoPromise = Repos.makeRepoPromise()
	    repoPromise
		    .then(function(chartData){
		      LanguageData.commits = chartData;
		      LanguageData.creates = chartData;
		      LanguageData.public_repos = chartData;
		      LanguageData.pushes = chartData;

					$state.transitionTo($state.current, $scope.data.nextLanguage, {
			      location: true, reload: true, inherit: true, notify: true
			    });
			    console.log($stateParams)
		    });

	    }

=======
>>>>>>> (feat/languagePage) Refactor the code for the language charts. Move functions to services.js
  }])



  