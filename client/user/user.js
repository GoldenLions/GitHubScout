var userapp = angular.module('githubscout.user', ['ui.router','nvd3ChartDirectives'])

<<<<<<< HEAD
userapp.controller('UserController', ['$scope', 'UserData', 'UserDateandCommits','UserLanguagesandCommits',function($scope, UserData,UserDateandCommits,UserLanguagesandCommits) {
=======


userapp.controller('UserController', ['$scope', 'UserData', 'getUserCommits', function($scope, UserData) {
>>>>>>> PLayed around with nvd3
  $scope.userdata =[];
  $scope.username = UserData.username
  $scope.userdata.data = UserData.rawDataCommitsByLanguage
  $scope.newDiv=function(){
             $scope.items= {title: 'GitHub User ' + UserData.username+ ' Commits By Langauges'}
        }

<<<<<<< HEAD
=======



  // getdateandCommits will return an array of object with object having the form {date:'2014-06-04', count:5}
  var getdateandCommits  = function(){
    console.log('user, getdateandCommits')
    var result = []
    var commit = {};
   for(var i =0; i<$scope.userdata.data.length; i++){
     var repo = $scope.userdata.data[i]
      for(var key in repo){
          if(key === "date"){
             if(commit[repo[key]]){
                commit[repo[key]]++;
             }else{
                commit[repo[key]]=1;
             }
          }
      }
    }
    for(var key in commit){
        result.push({date:key,count:commit[key]})
    }
    return result
  }
  // getUserCommitsperLanganguage will return an array of object with object having the form {language:'JavaScript', count:10}
  var getUserCommitsperLanganguage = function(){
    console.log('user, getUserCommitsperLanganguage')
      var result = []
      var commit ={}
      for(var i=0; i<$scope.userdata.data.length;i++){
        var repo = $scope.userdata.data[i].languages;
        for(var key in repo){
             if(commit[key]){
                commit[key]++
             }else{
               commit[key]=1
             }
         }

      }
      for(var key in commit){
         result.push({language:key,count:commit[key]})
      }
      return result;
  }

  $scope.userDateandCommits = getdateandCommits().reverse()
  $scope.userCommitsperLanguage = getUserCommitsperLanganguage()
  $scope.exampleData = [
      { key: "One", y: 5 },
          { key: "Two", y: 2 },
          { key: "Three", y: 9 },
          { key: "Four", y: 7 },
          { key: "Five", y: 4 },
          { key: "Six", y: 3 },
          { key: "Seven", y: 9 }
    ];
             // $scope.xAxisTickFormatFunction = function(){
             //     return function(d){
             //      console.log("date",d.date)
             //         return d.date;
             //     }
             // }

             // $scope.yAxisTickFormatFunction = function(){
             //     return function(d){
             //      console.log("count",d.count)
             //         return d.count;
             //     }
             // }
           

           $scope.descriptionFunction = function(){
               return function(d){
                   return d.language;
               }
           }

          var colorArray = ['#000000', '#660000', '#CC0000', '#FF6666', '#FF3333', '#FF6666', '#FFE6E6'];
          $scope.colorFunction = function() {
            return function(d, i) {
                return colorArray[i];
              };
          }
  


}])

//creating the d3 directive for commits for specific user
userapp.directive('usercommitChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='960' height='600'></svg>",
       link: function(scope, elem, attrs){

          console.log('user, usercommitChart')
           var dataPlot=scope.userDateandCommits

           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen

           var d3 = $window.d3;
           //console.log("window",$window)

           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);
          // console.log("rawSVG",rawSvg[0])

           //setting up the axis and labeling it

           function setChartParameters(){
>>>>>>> PLayed around with nvd3

  $scope.getdateandCommits = function(){

     return  UserDateandCommits.getdateandCommits($scope.userdata.data)
      }

  $scope.getUserCommitsperLanganguage = function(){

    return UserLanguagesandCommits.getUserCommitsperLanganguage($scope.userdata.data)

     }
    $scope.nextone; 
    $scope.userDateandCommits=$scope.getdateandCommits().reverse()
    $scope.userDateandCommits1=$scope.getdateandCommits().reverse()
    $scope.commitsperLangugageData = $scope.getUserCommitsperLanganguage()


    console.log( "daaaaatataatata", $scope.userDateandCommits)



   //Data for bar chart.
  
   $scope.commitsbyDateData =
                        [
                              {
                                  "key": UserData.username,
                                  "values": $scope.userDateandCommits
                              }
                            
                         ];

  
    $scope.compareUser = function(){
       

        $scope.commitsbyDateData =
               [
                 {
                     key: UserData.username,
                     values: $scope.userDateandCommits
                 },
                 { 
                    key: "User2",
                    values: [['2014/6',10],['2014/8',23],['2014/9',10]]

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

 

