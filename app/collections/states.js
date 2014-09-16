var db = require('../config');
var State = require('../models/state');

var States = new db.Collection();

States.model = State;

module.exports = States;
