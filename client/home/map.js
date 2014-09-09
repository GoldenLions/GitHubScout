

  var fetchGithubData = function() {
    var maxCount = 0;
    var colorScale;
    var countryData = {};
    var geojson;

    // reads the csv file with data about Github by country
    d3.csv('./data/home_map_country.csv', function(error, data){
      console.log('data', data)

      // get the max count value so we scale the colorScale
      maxCount = d3.max(data, function(d){
        return +d.events;
      })

      // create a color scale from yellow to red  
      colorScale = d3.scale.pow()
      .exponent(.2)
      .domain([0, maxCount])
      .range(["#FFEDA0", "#800026"]);

      // create a hash table that has count and color for each country
      data.forEach(function(d){
        countryData[d.country] = {events: +d.events,
         color: colorScale(d.events),
         users: +d.users};
       })

    // Initialize a map with center and zoom level
    var map = L.map('map').setView([45, 0],1);

    // Tile layer contains the map information from Mapbox
    L.tileLayer('http://{s}.tiles.mapbox.com/v3/wykhuh.jc1144hm/{z}/{x}/{y}.png',{
      maxZoom: 18
    }).addTo(map);


    // Sets color based on Github data
    function getColor(country){
      // console.log('countryData', countryData)
      if (countryData[country]) {
        var color = countryData[country].color 
      }
      return color || 'white'
    }

 
    // We use data from a GeoJSON file to draw the boundaries for each country.
    // Sets the style for GeoJSON layer.
    function style(feature){
      return {
        fillColor: getColor(feature.properties.country),
        weight: 2,
        opacity: 1,
        color: '#777',
        dashArray: '1',
        fillOpacity: 0.5
      };
    }

    function highlightFeature(e) {
      var layer = e.target;

      layer.setStyle({
        weight: 3,
        color: '#666',
        dashArray: '',
        fillOpacity: 0.7
      });

      info.update(layer.feature.properties);

      if (!L.Browser.ie && !L.Browser.opera) {
        layer.bringToFront();
      }
    }


    function resetHighlight(e) {
      geojson.resetStyle(e.target);
      info.update();
    }

    function zoomToFeature(e) {
      map.fitBounds(e.target.getBounds());
    }


    function onEachFeature(feature, layer) {
      layer.on({
        mouseover: highlightFeature,
        mouseout: resetHighlight,
        click: zoomToFeature
      });
    }

    var info = L.control();

    info.onAdd = function (map) {
      this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
      this.update();
      return this._div;
    };

    // method that we will use to update the control based on feature properties passed
    info.update = function (props) {

      if(props){
         var stats = countryData[props.country];
      }

      this._div.innerHTML = (props ?
        '<b>' + props.country + 
         '</b><br />' + stats.events + ' events' +
        '<br />' + stats.users + ' users'
        : 'Hover over a country');
    };
    
    info.addTo(map);




    // Add GeoJSON layer to the map.
    geojson = L.geoJson(countriesData, {
      style: style,
      onEachFeature: onEachFeature
    }).addTo(map);

    console.log('ddd',countryData)
    return countryData;

  })

}

var countryData = fetchGithubData();


