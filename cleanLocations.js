// In order to show Github user by location data on the homepage, 
// the date from Github Archives needs to be manually normalized. 
// The code currenlty normalizes the data, but it doesn't run automatically.
// You have to manually run cleanLocations.js

var express = require('express');
var bodyParser = require('body-parser');
var handler = require('./server/handlerCleanLocations.js');
var app = express();
var port = port = process.env.PORT || 8000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

app.get('/api/locations', function(req, res){
  res.send('GET api/locations');

  handler.splitLocations();
  handler.setStateOnly();
  handler.setCountryOnly();
  handler.setCityOnly();
  handler.setCity();
  handler.setCityReverse();

});

var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});

