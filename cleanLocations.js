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

  // handler.splitLocations();
  // handler.setStateOnly();
  // handler.setCountryOnly();
  // handler.setCityOnly();
    // handler.setCity();

  handler.setCityReverse();

});

var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});

