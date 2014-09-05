var userapp = angular.module('githubscout.user', ['ui.router','nvd3ChartDirectives'])

userapp.controller('UserController', ['$scope', 'UserData', 'UserDateandCommits','UserLanguagesandCommits',function($scope, UserData,UserDateandCommits,UserLanguagesandCommits) {
  $scope.userdata =[];
  $scope.userdata.data = UserData.rawDataCommitsByLanguage


  $scope.getdateandCommits = function(){

     return  UserDateandCommits.getdateandCommits($scope.userdata.data)
      }

  $scope.getUserCommitsperLanganguage = function(){

    return UserLanguagesandCommits.getUserCommitsperLanganguage($scope.userdata.data)

     }

    $scope.userDateandCommits=$scope.getdateandCommits().reverse()
    $scope.commitsperLangugageData = $scope.getUserCommitsperLanganguage()

   //Data for bar chart.
   $scope.commitsbyDateData = [
                 {
                     key: "Series 1",
                     values: $scope.userDateandCommits
                 }
               
             ];

  //Function that allows nvd3 and d3 to access x values from the ‘data’. 
  $scope.xFunction = function() {
    return function(d) {
      return d.language;
    };
  }
  //Function that allows nvd3 and d3 to access y values from the ‘data’.
  $scope.yFunction = function() {
    return function(d) {
      return d.count;
    };
  }
}])

 

