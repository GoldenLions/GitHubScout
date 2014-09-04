var db = require('../config');

var GithubLocation = db.Model.extend({
  tableName: 'github_locations',
  hasTimestamps: false
});

module.exports = GithubLocation;