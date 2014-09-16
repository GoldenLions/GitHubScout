var userapp = angular.module('githubscout.user', ['ui.router','nvd3ChartDirectives'])

userapp.controller('UserController', ['$scope', 'UserData', 'UserSearch', 'UserDateandCommits','UserLanguagesandCommits','UserCompareRescaleBar',function($scope, UserData, UserSearch, UserDateandCommits,UserLanguagesandCommits,UserCompareRescaleBar) {
  $scope.userdata ={};
  $scope.username = UserData.username
  $scope.userdata.data = UserData.rawDataCommitsByLanguage

  var getCompareRescaleBar = function(firstUserData,secondUserData){
    return UserCompareRescaleBar.getCompareRescaleBar($scope.userDateandCommits, secondUserData)
  }

  var getdateandCommits = function(data){
    return UserDateandCommits.getdateandCommits(data)
  }

  var getUserCommitsperLanganguage = function(data){
    return UserLanguagesandCommits.getUserCommitsperLanganguage(data)
  }

  $scope.userDateandCommits = getdateandCommits($scope.userdata.data).reverse()

  // Data for first user bar chart.
  $scope.commitsbyDateData =[{
    key : $scope.username,
    values : $scope.userDateandCommits
  }];

  // Data for first user pie chart.
  $scope.commitsperLangugageData = getUserCommitsperLanganguage($scope.userdata.data)

  // Function grabs second user's data from compare user input to compare with first user on same commits over time chart AND to display second pie chart.
  $scope.addUser = function () {

    // This will add a header for the second pie chart.
    $scope.items = {title: 'GitHub User '+ $scope.userdata.nextUsername + ' Commits By Langauges'}

    UserSearch.getUserCommitsByLanguage({username: $scope.userdata.nextUsername})
      .then(function (data) {
        var secondUserDateandCommits = getdateandCommits(data).reverse()
        var combinedNewandOldUserDatesData = getCompareRescaleBar($scope.userDateandCommits, secondUserDateandCommits)

        // Data for first AND second user bar chart.
        $scope.commitsbyDateData =
          [{
           key: $scope.username,
           values: combinedNewandOldUserDatesData
          },
          {
            key: $scope.userdata.nextUsername,
            values: secondUserDateandCommits
          }];

        //gets data for second user's commits by language, which is displayed as a pie chart.
        $scope.commitsperLangugageDataUser2 = getUserCommitsperLanganguage(data)

      })
  }

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
