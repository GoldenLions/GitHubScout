var Bookshelf = require('bookshelf');

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


// var knex = require('knex')({
//   client: 'mysql',
//   connection: {
//     host     : '127.0.0.1',
//     user     : 'rood',
//     password : '',
//     database : 'githubscout',
//     charset  : 'utf8'
//   }
// });

// var Bookshelf = require('bookshelf')(knex);




module.exports = db;