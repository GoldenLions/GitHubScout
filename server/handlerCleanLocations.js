var bodyParser = require('body-parser');

var db = require('../app/config');
var Cities = require('../app/collections/cities');
var City = require('../app/models/city');
var Countries = require('../app/collections/countries');
var Country = require('../app/models/country');
var GithubLocation = require('../app/models/githublocation');
var GithubLocations = require('../app/collections/githublocations');


var handler = {};


handler.fetchCountries = function(req,res){
  console.log('fetchCountries');

  Countries.reset().fetch().then(function(results){
    console.log(results.models);
    // res.send(200, results.models);

  })
};


module.exports = handler;
