var db = require('../config');

var Country = db.Model.extend({
  tableName: 'countries',
  hasTimestamps: false
});

module.exports = Country;