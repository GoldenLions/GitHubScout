var request = require('superagent');
var cheerio = require('cheerio');
var Batch = require('batch');
var _ = require('lodash');
var fs = require('fs');
var languages = require('./languages.js')


// Utility functions.
var utils = {
  // Uses batch to perform 10 GET requests at a time.
  // Calls progressback on each response body, placing the result in an accumulating results array.
  // Upon completion, calls callback on the finished results array.
  batchGet: function(urls,progressback,callback) {
    var batch = new Batch();
    batch.concurrency(10);
    _.each(urls, function(url) {
      batch.push(function(done) {
        request
        .get(url)
        .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
        .end(function(error,response) {
          if (error) throw new Error(error);
          if (response.error) console.log(response.status,response.error);
          var result = progressback(response.text);
          done(error,result);
        });
      });
    });
    batch.on('progress', function(e){
      console.log(e);
    });
    batch.end(function(error,results) {
      if (error) throw new Error(error);
      callback(results);
    });
  },
  // One GET request at least every delay milliseconds.
  throttledBatchGet: function(urls,progressback,callback,delay) {
    var batch = new Batch();
    _.each(urls, function(url, i) {
      batch.push(function(done) {
        setTimeout(function() {
          request
          .get(url)
          .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
          .end(function(error,response) {
            if (error) throw new Error(error);
            if (response.error) console.log(response.status,response.error);
            var result = progressback(response.text);
            done(error,result);
          }); 
        }, delay*i);
      });
    });
    batch.on('progress', function(e){
      console.log(e);
    });
    batch.end(function(error,results) {
      if (error) throw new Error(error);
      callback(results);
    });
  },
  // progressback to pull the user URLs out of the response body items.
  parseUserItems: function(response) {
    return _.map(JSON.parse(response).items,function(item) {
      return item.html_url;
    });
  },
  parseRepoItems: function(response) {
    return _.map(JSON.parse(response).items,function(item) {
      return {
        html_url: item.html_url,
        size: item.size
      }
    });
  },
  // progressback that uses cheerio to parse the response body, which in this case is just HTML.
  // Pulls various figures out of the HTML.
  scrapeProfileStats: function(html) {
    var $ = cheerio.load(html);
    return {
      full_name: $('[itemprop=name]').text(),
      username: $('[itemprop=additionalName]').text(),
      location: $('[itemprop=homeLocation]').text(),
      join_date: $('.vcard-details').find('time').text(),
      popular_repos_stars: _.reduce($($('.boxed-group-inner.mini-repo-list')[0]).children(), 
        function(memo,item) {
          return memo + parseInt($(item).find('.stars').text().replace(/[\s|,]/g,''));
        }, 0),
      primary_languages: (function() {
        var langs = / in (.+)\. /g.exec($('meta[name=description]').attr('content'));
        if (langs) {
          return langs[1].match(/\b(?!and\b)\w+\b/g);
        } else return [];
      })(),
      contributions: parseInt($('.table-column.contrib-day').find('.num').text()),
      followers: $($('.vcard-stats').children()[0]).find('.vcard-stat-count').text()
    };
  },
  scrapeRepoStats: function(html) {
    var $ = cheerio.load(html);
    return {

    };
  }
};

// Updates top-user-urls.json to reflect the current top 1000 users according to the
// search query.
var updateUserUrlsJSON = function(callback) { 
  // Sets the query parameters for the GitHub search API.
  // Takes the first 10 pages of users with a minimum of minFollowers followers,
  // minRepos repos, and sorts by followers in descending order.
  // This does not guarantee that we will find the users with the most contributions, or 
  // number of stars, but because we can only ask GitHub to sort by followers, join date,
  // and number of repos, this list is probably the best starting point available. 
  var minFollowers = 50;
  var minRepos = 5;
  var config = '?client_id=bf7e0962f270bf033f78'
  +'&client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
  +'&q=followers%3A>'+minFollowers+'+repos%3A>'+minRepos
  +'&per_page=100';
  var pages = [1,2,3,4,5,6,7,8,9,10];
  var userSearchURLS = _.map(pages, function(page) {
    return 'https://api.github.com/search/users'+config+'&l=&o=desc&ref=advsearch&s=followers&page='+page;
  });
  // Gets the 1000 top users, writes them to a .json.
  utils.batchGet(userSearchURLS, utils.parseUserItems, function(results) {
    results = _.flatten(results);
    fs.writeFileSync('top-user-urls.json',JSON.stringify(results,null,2));
    console.log('updateUserUrlsJSON finished.');
    if (callback) callback();
  });
};

// Updates top-user-stats.json to reflect the current stats of the top 1000 users found 
// found previously.
var updateProfileStatsJSON = function(callback) {
  // The profile urls corresponding to the 1000 users found previously.
  var profileURLS = JSON.parse(fs.readFileSync('top-user-urls.json'));
  // Scrapes statistics from the profile URLs, writes the stats to a .json.
  utils.batchGet(profileURLS, utils.scrapeProfileStats, function(results) {
    fs.writeFileSync('top-user-stats.json',JSON.stringify(results,null,2));
    console.log('updateProfileStatsJSON finished.');
    if (callback) callback();
  });
};

var updateRepoUrlsJSON = function(callback) {
  var minStars = 1;
  var config = '?client_id=bf7e0962f270bf033f78'
  +'&client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
  +'&per_page=20&sort=stars&order=desc';
  var repoSearchUrls = _.map(languages, function(language) {
    return 'https://api.github.com/search/repositories'+config
           +'&q=stars%3A>'+minStars+'+language%3A'+encodeURIComponent(language);
  });
  utils.throttledBatchGet(repoSearchUrls, utils.parseRepoItems, function(results) {
    results = _.flatten(results);
    fs.writeFileSync('top-repo-urls.json',JSON.stringify(results,null,2));
    console.log('updateRepoUrlsJSON finished.');
    if (callback) callback();
  }, 3000);
};





