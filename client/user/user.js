var userapp = angular.module('githubscout.user', ['ui.router'])

userapp.controller('UserController', ['$scope','$http', 'UserData', 'getUserCommits',function($scope, $http, UserData) {
  $scope.userdata =[];
  $scope.userdata.data = UserData.rawDataCommitsByLanguage

  // getdateandCommits will return an array of object with object having the form {date:'2014-06-04', count:5}
  var getdateandCommits  = function(){
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
  

}])

//creating the d3 directive for commits for specific user
userapp.directive('usercommitChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='1200' height='600'></svg>",
       link: function(scope, elem, attrs){
      
           var dataPlot=scope.userDateandCommits
           console.log("herrrre",dataPlot)

          //console.log("this is the scope",dataPlot)
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

             xScale = d3.scale.linear()
             .domain([0, dataPlot.length-1])
             .range([padding + 5, rawSvg.attr("width") - padding]);

             yScale = d3.scale.linear()
             .domain([0, d3.max(dataPlot, function (d) {

               return parseInt(d.count);
             })])
             .range([400 - padding, 0]);

             xAxisGen = d3.svg.axis()
             .scale(xScale)
             .tickFormat(function(d,i) { return dataPlot[d].date})
             .orient("bottom")
             .ticks(dataPlot.length - 1);


                   yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5)

                 }

                 function drawLineChart() {


                   setChartParameters();

                   svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(10,380)")
                   .call(xAxisGen)
                   .selectAll("text")
                   .style("text-anchor", "end")
                   .attr("dx", "-.8em")
                   .attr("dy", ".15em")
                   .attr("transform", function(d) {
                     return "rotate(-65)"
                   });


                   svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(40,0)")
                   .call(yAxisGen);

               svg.selectAll('bar')
                  .data(dataPlot)
                  .enter()
                  .append('rect')
                  .attr("x",function(d,i){return (0.94*i*rawSvg.attr("width"))/(dataPlot.length - 1)})
                  .attr('width',20)
                  .attr('height',0)
                  .attr("transform", "translate(40,0)")
                  .attr('fill','steelblue')
                  .transition()
                  .delay(function(d, i) { return i * 100; })
                  .duration(500)
                  .attr('y',function(d){ return yScale(d.count)})
                  .attr('height',function(d,i){return 380-yScale(d.count) })

           }

           drawLineChart();
       }
   };
})

//creating the d3 directive commites for languages for specific user
userapp.directive('userlangaugeChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='1200' height='600'></svg>",
       link: function(scope, elem, attrs){
      
           var dataPlot=scope.userCommitsperLanguage
           console.log("herrrre",dataPlot)

          //console.log("this is the scope",dataPlot)
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

             xScale = d3.scale.linear()
             .domain([0, dataPlot.length-1])
             .range([padding + 5, rawSvg.attr("width") - padding]);

             yScale = d3.scale.linear()
             .domain([0, d3.max(dataPlot, function (d) {

               return parseInt(d.count);
             })])
             .range([400 - padding, 0]);

             xAxisGen = d3.svg.axis()
             .scale(xScale)
             .tickFormat(function(d,i) { return dataPlot[d].language})
             .orient("bottom")
             .ticks(dataPlot.length - 1);

                   //console.log("xscale",xAxisGen)


                   yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5)

                 }

                 function drawLineChart() {


                   setChartParameters();

                   svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(10,380)")
                   .call(xAxisGen)
                   .selectAll("text")
                   .style("text-anchor", "end")
                   .attr("dx", "-.8em")
                   .attr("dy", ".15em")
                   .attr("transform", function(d) {
                     return "rotate(-65)"
                   });


                   svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(40,0)")
                   .call(yAxisGen);

               svg.selectAll('bar')
                  .data(dataPlot)
                  .enter()
                  .append('rect')
                  .attr("x",function(d,i){return (0.94*i*rawSvg.attr("width"))/(dataPlot.length - 1)})
                  .attr('width',20)
                  .attr('height',0)
                  .attr("transform", "translate(40,0)")
                  .attr('fill','steelblue')
                  .transition()
                  .delay(function(d, i) { return i * 100; })
                  .duration(500)
                  .attr('y',function(d){ return yScale(d.count)})
                  .attr('height',function(d,i){return 380-yScale(d.count) })

           }

           drawLineChart();
       }
   };
}).scale(xScale)
             .tickFormat(function(d,i) { return dataPlot[d].language})
             .orient("bottom")
             .ticks(dataPlot.length - 1);

                   //console.log("xscale",xAxisGen)


                   yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5)

                 }

<<<<<<< HEAD
         function drawBarChart() {
=======
                 function drawLineChart() {
>>>>>>> lost_detached_head


                   setChartParameters();

                   svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(10,380)")
                   .call(xAxisGen)
                   .selectAll("text")
                   .style("text-anchor", "end")
                   .attr("dx", "-.8em")
                   .attr("dy", ".15em")
                   .attr("transform", function(d) {
                     return "rotate(-65)"
                   });


                   svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(40,0)")
                   .call(yAxisGen);

               svg.selectAll('rect')
                  .data(dataPlot)
                  .enter()
                  .append('rect')
       
                  .attr("x",function(d,i){return (0.94*i*rawSvg.attr("width"))/(dataPlot.length - 1)})
                  .attr('width',20)
                  .attr('height',0)
<<<<<<< HEAD
                  .transition()
                  .delay(function(d, i) { return i * 100; })
                  .duration(500)
                  .attr('y',function(d){ return rawSvg.attr("height")-yScale(d.count)})
                  .attr('height',function(d,i){return yScale(d.count) })
                  .attr("transform", "translate(40,-120)")
=======
                  .attr("transform", "translate(40,0)")
>>>>>>> lost_detached_head
                  .attr('fill','steelblue')
                 
           }

           drawBarChart();
       }
   };
})
user.directive('userlangaugeChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='1200' height='400'></svg>",
       link: function(scope, elem, attrs){
           var dataPlot=scope.userdata.fakedata;

          console.log("this is the scope",dataPlot)
           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen

           var d3 = $window.d3;
           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);
           //setting up the axis and labeling it

           function setChartParameters(){

               xScale = d3.scale.linear()
                   .domain([0, dataPlot.length-1])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(dataPlot, function (d) {

                       return (d.count);
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .tickFormat(function(d,i) { return dataPlot[d].language})
                   .orient("bottom")
                   .ticks(dataPlot.length - 1);


               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(5)

           }

         function drawBarChart() {


               setChartParameters();

               svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(10,280)")
                   .call(xAxisGen)
                   .selectAll("text")
                               .style("text-anchor", "end")
                               .attr("dx", "-.8em")
                               .attr("dy", ".15em")
                               .attr("transform", function(d) {
                                   return "rotate(-65)"
                                   });


               svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(40,-100)")
                   .call(yAxisGen);

               svg.selectAll('rect')
                  .data(dataPlot)
                  .enter()
                  .append('rect')
       
                  .attr("x",function(d,i){return (0.94*i*rawSvg.attr("width"))/(dataPlot.length - 1)})
                  .attr('y', 200)
                  .attr('width',20)
                  .attr('height',0)
                  .transition()
                  .delay(function(d, i) { return i * 100; })
                  .duration(500)
<<<<<<< HEAD
                  .attr('y',function(d){ return rawSvg.attr("height")- yScale(d.count)})
                  .attr('height',function(d,i){return  yScale(d.count) })
                  .attr("transform", "translate(40,-120)")
                  .attr('fill','steelblue')
                 
=======
                  .attr('y',function(d){ return yScale(d.count)})
                  .attr('height',function(d,i){return 380-yScale(d.count) })

>>>>>>> lost_detached_head
           }

           drawBarChart();
       }
   };
})
