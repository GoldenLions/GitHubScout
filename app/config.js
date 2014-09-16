var Bookshelf = require('bookshelf');

var db = Bookshelf.initialize({
  client: 'mysql',
    host: '127.0.0.1',
    user: 'root',
    password: '',
    database: 'githubscout',
    charset: 'utf8',
  }
});

module.exports = db;