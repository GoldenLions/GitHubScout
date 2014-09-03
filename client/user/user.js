var user = angular.module('githubscout.user', ['ui.router'])

user.controller('UserController', ['$scope','$http', 'UserData', function($scope, $http, UserData) {
  $scope.userdata =[];

  $scope.userdata.data = UserData.rawDataCommitCount
  $scope.userdata.data1 = UserData.rawDataCommitsByLanguage
  $scope.userdata.fakedata = [
  {"language":"javascript","count":120},
  {"language":"ruby","count":100},
  {"language":"python","count":70}
  ];
  // var dateLanguageCountperUser ={};
  // for(var i =0; i<$scope.userdata.data1.length; i++){
       
  //       if(dateLanguageCountperUser[Object.keys($scope.userdata.data1[i].languages)[0]]){
  //           dateLanguageCountperUser[Object.keys($scope.userdata.data1[i].languages)[0]]++             
  //       }else{
  //          dateLanguageCountperUser[Object.keys($scope.userdata.data1[i].languages)[0]]=1
  //       }
        
  // }
  // console.log("this is javascriptcount",dateLanguageCountperUser)


}])

user.directive('usercommitChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='1200' height='400'></svg>",
       link: function(scope, elem, attrs){
           var dataPlot=scope.userdata.data;

          console.log("this is the scope",dataPlot)
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
              var max = d3.max(dataPlot, function(d) { return d.count });
              console.log("maxxxxxx1",max)

               xScale = d3.scale.linear()
                   .domain([0, dataPlot.length-1])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(dataPlot, function (d) {

                       return d.count
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .tickFormat(function(d,i) { return dataPlot[d].date})
                   .orient("bottom")
                   .ticks(dataPlot.length - 1);

                   //console.log("xscale",xAxisGen)


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
                  .attr('y',function(d){ return rawSvg.attr("height")-yScale(d.count)})
                  .attr('height',function(d,i){return yScale(d.count) })
                  .attr("transform", "translate(40,-120)")
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
                  .attr('y',function(d){ return rawSvg.attr("height")- yScale(d.count)})
                  .attr('height',function(d,i){return  yScale(d.count) })
                  .attr("transform", "translate(40,-120)")
                  .attr('fill','steelblue')
                 
           }

           drawBarChart();
       }
   };
});
