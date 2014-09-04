angular.module('githubscout.language', ['nvd3ChartDirectives', 'ui.router'])

  .controller('LanguageController', ['$scope', function($scope){

    $scope.commits = [{
      "key": "Github Api Mean Web Response Time",
      values: [[1,1], [3,3]]
    }];

    $scope.creates = [{
      "key": "Github Api Mean Web Response ",
      values: [[5,5], [3,3]]
    }];


    $scope.public_repos = [{
      "key": "Github Api Mean Web Response ",
      values: [[5,5], [3,3]]
    }];


    $scope.pushes = [{
      "key": "Github Api Mean Web Response ",
      values: [[5,5], [3,3]]
    }];


  }])
  

  


  