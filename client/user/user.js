var userapp = angular.module('githubscout.user', ['ui.router','nvd3ChartDirectives'])

userapp.controller('UserController', ['$scope', 'UserData', 'UserDateandCommits','UserLanguagesandCommits','UserCompareRescaleBar',function($scope, UserData,UserDateandCommits,UserLanguagesandCommits,UserCompareRescaleBar) {
  $scope.userdata =[];
  $scope.username = UserData.username
  $scope.userdata.data = UserData.rawDataCommitsByLanguage
  $scope.newDiv=function(){
             $scope.items= {title: 'GitHub User '+ UserData.username + ' Commits By Langauges'}
        }
   $scope.getCompareRescaleBar = function(){
       return UserCompareRescaleBar.getCompareRescaleBar($scope.userDateandCommits,seconduser)
   }



  $scope.getdateandCommits = function(){

     return  UserDateandCommits.getdateandCommits($scope.userdata.data)
      }

  $scope.getUserCommitsperLanganguage = function(){

    return UserLanguagesandCommits.getUserCommitsperLanganguage($scope.userdata.data)

     }

    $scope.userDateandCommits=$scope.getdateandCommits().reverse()
    console.log("myyyyyy data",  $scope.userDateandCommits)
    $scope.userDateandCommits1=$scope.getdateandCommits().reverse()
    $scope.commitsperLangugageData = $scope.getUserCommitsperLanganguage()

   //Data for bar chart.
  
   $scope.commitsbyDateData =
                        [
                              {
                                  "key": UserData.username,
                                  "values": $scope.userDateandCommits
                              }
                            
                         ];

    var seconduser = [['2014/4',10],['2014/5',10],['2014/6',10],['2014/8',23],['2014/9',10]]
    $scope.compareUser = function(){
    $scope.CombinedNewandOldUserDatesData = $scope.getCompareRescaleBar()

     console.log("oldnew",$scope.CombinedNewandOldUserDatesData )
       

        $scope.commitsbyDateData =
               [
                 {
                     key: UserData.username,
                     values: $scope.CombinedNewandOldUserDatesData
                 },
                 { 
                    key: "User2",
                    values: seconduser

                 }
               
            ]; 

      $scope.commitsperLangugageData1 = $scope.getUserCommitsperLanganguage()



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
}])

 

