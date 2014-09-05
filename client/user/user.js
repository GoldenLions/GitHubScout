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
  $scope.userDateandCommits1=$scope.getdateandCommits().reverse()
  $scope.commitsperLangugageData = $scope.getUserCommitsperLanganguage()


  console.log( "daaaaatataatata", $scope.userDateandCommits)



   //Data for bar chart.

  $scope.commitsbyDateData =
  [{
    "key": "Series 1",
    "values": $scope.userDateandCommits
  }];



  $scope.compareUser = function(){
    $scope.commitsbyDateData =
    [{
     key: "Series 1",
     values: $scope.userDateandCommits
    },
    {
      key: "Series 2",
      values: $scope.userDateandCommits1
    }];

  $scope.commitsperLangugageData1 = $scope.getUserCommitsperLanganguage()

}

$scope.xAxisTickFormat = function(){
  return function(d){
          //console.log("datttttes",d)
            return d3.time.format('%x')(new Date(d));  //uncomment for date format
          };
        };

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



