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
// app.use(express.static(__dirname + '/client'));

// TO DO: routes, API setup


// app.get('/',function(req,res) {
//   console.log('GET /');
// });

app.get('/hello', function(req, res){
  res.send('Hello World');
});

app.get('/api/locations', function(req, res){
  res.send('GET api/locations');
  //  handler.fetchCountries(function(item){
  //       console.log('item', item)
  //       handler.fetchGithubLocations(item);
  // })

 handler.fetchCountries()

  // this works
  // handler.fetchGithubLocations('Argentina');
  
 
});


app.post('/api/locations',function(req,res) {
  console.log('POST /api/locations');
  // handlerCleanLocation.getUserCommitCountsByDate(req,res);
});

var server = app.listen(port, function() {
  return console.log("Listening on port " + server.address().port);
});

