var db = require('../config');
var GithubLocation = require('../models/githublocation');

var GithubLocations = new db.Collection();

GithubLocations.model = GithubLocation;

module.exports = GithubLocations;
