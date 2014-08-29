var express = require('express');
var bodyParser = require('body-parser');
var handler = require('server/handler.js');

var app = express();
var port = port = process.env.PORT || 8000;

app.set('port', port);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));

// TO DO: routes, API setup

var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});
