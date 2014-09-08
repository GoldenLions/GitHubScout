var db = require('../config');
var City = require('../models/city');

var Cities = new db.Collection();

Cities.model = City;

module.exports = Cities;
