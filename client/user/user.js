var userapp = angular.module('githubscout.user', ['ui.router','nvd3ChartDirectives'])

userapp.controller('UserController', ['$scope', 'UserData', 'UserDateandCommits', 'UserSearch', 'UserLanguagesandCommits',function($scope, UserData,UserDateandCommits,UserSearch,UserLanguagesandCommits) {
  $scope.userdata ={};
  $scope.username = UserData.username
  $scope.userdata.data = UserData.rawDataCommitsByLanguage
  $scope.newDiv=function(){
             $scope.items= {title: 'GitHub User '+ UserData.username + ' Commits By Langauges'}
        }


  $scope.getdateandCommits = function(data){
    return UserDateandCommits.getdateandCommits(data)
  }

  $scope.getUserCommitsperLanganguage = function(data){
    return UserLanguagesandCommits.getUserCommitsperLanganguage(data)
  }

  // Function grabs second user's data from compare user input to compare with first user on same commits over time chart
  $scope.addUser = function() {
    console.log('addUser')
    UserSearch.getUserCommitsByLanguage({username: $scope.userdata.nextUsername})
      .then(function (data) {
        $scope.secondUserDateandCommits = $scope.getdateandCommits(data).reverse()
        $scope.commitsbyDateData =
          [{
           key: "Series 1",
           values: $scope.userDateandCommits
          },
          {
            key: "Series 2",
            values: $scope.secondUserDateandCommits
          }];
        $scope.commitsperLangugageDataUser2 = $scope.getUserCommitsperLanganguage(data)
      })
  }

  $scope.userDateandCommits = $scope.getdateandCommits($scope.userdata.data).reverse()
  $scope.commitsperLangugageData = $scope.getUserCommitsperLanganguage($scope.userdata.data)

  //Data for bar chart.
  $scope.commitsbyDateData = [{
    key: "Series 1",
    values: $scope.userDateandCommits
  }];

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
}]);
