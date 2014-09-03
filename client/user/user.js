angular.module('githubscout.user', ['ui.router'])

.controller('UserController', ['$scope','$http', 'UserData', function($scope, $http, UserData) {
  $scope.userdata =[];
  $scope.userdata.data = UserData.rawDataCommitCount
}])

.directive('usercommitChart', function($window){
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

             xScale = d3.scale.linear()
             .domain([0, dataPlot.length-1])
             .range([padding + 5, rawSvg.attr("width") - padding]);

             yScale = d3.scale.linear()
             .domain([0, d3.max(dataPlot, function (d) {

               return (d.count*2.4);
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

                 function drawLineChart() {


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

               svg.selectAll('bar')
                  .data(dataPlot)
                  .enter()
                  .append('rect')
                  .attr("x",function(d,i){return (0.94*i*rawSvg.attr("width"))/(dataPlot.length - 1)})
                  .attr('y', 200)
                  .attr('width',20)
                  .attr('height',0)
                  .attr("transform", "translate(40,-120)")
                  .attr('fill','steelblue')
                  .transition()
                  .delay(function(d, i) { return i * 100; })
                  .duration(500)
                  .attr('y',function(d){ return rawSvg.attr("height")-d.count*20})
                  .attr('height',function(d,i){return d.count*20 })

           }

           drawLineChart();
       }
   };
});
