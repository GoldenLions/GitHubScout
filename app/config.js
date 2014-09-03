var Bookshelf = require('bookshelf');
var part = require('path');

var db = Bookshelf.initialize({
  client: 'mysql',
  connection: {
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'githubscout',
    charset: 'utf8',
  }
});


db.knex.schema.hasTable('cities').then(function(exists) {
  if (exists) {

      console.log('Created cities Table', table);
  }
});


module.exports = db;