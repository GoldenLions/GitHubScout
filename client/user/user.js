angular.module('githubscout.user', ['ui.router'])

.controller('UserController', ['$scope','$http', 'User', function($scope, $http, User) {
	$scope.userdata =[];
	$scope.userdata.data = User.data
}])

.directive('linearChart', function($window){
   return{
      restrict:'EA',
      template:"<svg width='850' height='200'></svg>",
       link: function(scope, elem, attrs){
           var salesDataToPlot=scope.userdata.data;

          console.log("this is the scope",salesDataToPlot)
           var padding = 20;
           var pathClass="path";
           var xScale, yScale, xAxisGen, yAxisGen

           var d3 = $window.d3;
           console.log("window",$window)

           var rawSvg=elem.find('svg');
           var svg = d3.select(rawSvg[0]);
          // console.log("rawSVG",rawSvg[0])

           //setting up the axis and labeling it

           function setChartParameters(){

               xScale = d3.scale.linear()
                   .domain([0, salesDataToPlot.length-1])
                   .range([padding + 5, rawSvg.attr("width") - padding]);

               yScale = d3.scale.linear()
                   .domain([0, d3.max(salesDataToPlot, function (d) {

                       return d.count;
                   })])
                   .range([rawSvg.attr("height") - padding, 0]);

               xAxisGen = d3.svg.axis()
                   .scale(xScale)
                   .tickFormat(function(d,i) { return salesDataToPlot[d].date})
                   .orient("bottom")
                   .ticks(salesDataToPlot.length - 1);

                   console.log("xscale",xAxisGen)


               yAxisGen = d3.svg.axis()
                   .scale(yScale)
                   .orient("left")
                   .ticks(4)
            

               // lineFun = d3.svg.line()
               //     .x(function (d) {
               //         return xScale(d.hour);
               //     })
               //     .y(function (d) {
               //         return yScale(d.sales);
               //     })
               //     .interpolate("basis");
           }
         
         function drawLineChart() {


               setChartParameters();

               svg.append("svg:g")
                   .attr("class", "x axis")
                   .attr("transform", "translate(15,180)")
                   .call(xAxisGen);


               svg.append("svg:g")
                   .attr("class", "y axis")
                   .attr("transform", "translate(30,0)")
                   .call(yAxisGen);

               svg.selectAll('bar')
                  .data(salesDataToPlot)
                  .enter()
                  .append('rect')
                  .attr("x",function(d,i){return (0.9*i*rawSvg.attr("width"))/(salesDataToPlot.length - 1)})
                  .attr('y', 200)
                  .attr('width',20)
                  .attr('height',0)
                  .attr("transform", "translate(30,-20)")
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

