var db = require('../config');
var City = require('../models/githublocations');

var GithubLocations = new db.Collection();

GithubLocations.model = GithubLocation;

module.exports = GithubLocation;
