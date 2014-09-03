var db = require('../config');

var Country = db.Model.extend({
  tableName: 'countries',
  hasTimestamps: false
});

moduel.exports = Country;