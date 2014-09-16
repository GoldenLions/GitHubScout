var db = require('../config');
var Country = require('../models/country');

var Countries = new db.Collection();

Countries.model = Country;

module.exports = Countries;
