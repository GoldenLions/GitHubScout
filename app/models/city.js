var db = require('../config');

var City = db.Model.extend({
  tableName: 'cities',
  hasTimestamps: false
});

moduel.exports = City;