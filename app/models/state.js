var db = require('../config');

var State = db.Model.extend({
  tableName: 'states',
  hasTimestamps: false
});

module.exports = State;