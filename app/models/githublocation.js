var db = require('../config');

var GithubLocation = db.Model.extend({
  tableName: 'github_map',
  hasTimestamps: false
});

moduel.exports = GithubLocation;