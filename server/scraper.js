var request = require('superagent');
var cheerio = require('cheerio');
var async = require('async');
var _ = require('lodash');
var fs = require('fs');

var languages = require('./languages.js')



// Utility functions.
var utils = {
  // Uses async to perform 10 GET requests at a time.
  // Calls progressback on each response body, placing the result in an accumulating results array.
  // Expects objs to be an array of objects with the .url property.
  // Upon completion, calls callback on the finished results array.
  batchGet: function(objs,progressback,callback) {
    var progress = 0;
    async.mapLimit(objs, 10, function(obj, done) {
      request
      .get(obj.url)
      .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
      .end(function(error,response) {
        if (error) console.log( new Error(error) );
        if (response.error) console.log(response.status,response.error);
        console.log('Progress: ',++progress+'/'+objs.length);
        var result = progressback(response.text,obj);
        done(error,result);
      });
    }, callback);
  },
  // One GET request at least every delay milliseconds.
  // Expects objs to be an array of objects with the .url property.
  // Not using async at the moment because it isn't clear how to throttle... 
  throttledBatchGet: function(objs,progressback,callback,delay) {
    var progress = 0;
    var results = [];
    var queue = _.map(objs, function(obj) {
      return function() {
        request
        .get(obj.url)
        .set('User-Agent', 'curl/7.24.0 (x86_64-apple-darwin12.0) libcurl/7.24.0 OpenSSL/0.9.8r zlib/1.2.5')
        .end(function(error,response) {
          if (error) console.log( new Error(error) );
          if (response.error) console.log(response.status,response.error);
          console.log('Progress: ',++progress+'/'+objs.length);
          var result = progressback(response.text,obj);
          results.push(result);
        }); 
      };
    });

    queue.pop()();
    var interval = setInterval(function() {
      if (queue.length === 0 ) {
        clearInterval(interval);
        return callback(null, results);
      };
      queue.pop()();
    },delay);
  },
  // progressback to pull the user URLs out of the response body items.
  parseUserItems: function(response,obj) {
    var result = _.map(JSON.parse(response).items,function(item) {
      return {
        url: item.html_url
      };
    });
    return result;
  },
  // progressback to pull the repo URL, size, and primary language out of each response body item.
  parseRepoItems: function(response,obj) {
    var result = _.map(JSON.parse(response).items,function(item) {
      return {
        url: item.html_url,
        size: item.size,
        language: item.language
      };
    });
    fs.writeFileSync('./leaderboard-data/repoUrls/top-repo-urls-'+encodeURIComponent(obj.language)+'.json',
      JSON.stringify(result,null,2));
    console.log(obj.language,'done.');
    return result;
  },
  // progressback that uses cheerio to parse the response body, which in this case is just HTML.
  // Pulls various figures out of the profile HTML and decorates the input obj.
  scrapeProfileStats: function(html,obj) {
    var $ = cheerio.load(html);
    return _.extend(obj, {
      full_name: $('[itemprop=name]').text(),
      username: $('[itemprop=additionalName]').text(),
      location: $('[itemprop=homeLocation]').text(),
      join_date: $('.vcard-details').find('time').text(),
      popular_repos_stars: _.reduce($('.boxed-group-inner.mini-repo-list').first().children(), 
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
      followers: $('.vcard-stats .vcard-stat:first-child').find('.vcard-stat-count').text()
    });
  },
  // progressback to scrape various figures from the repo page HTML.
  scrapeRepoStats: function(html,obj) {
    var $ = cheerio.load(html);
    return _.extend(obj, {
      stars: $('.social-count.js-social-count').text().trim(),
      forks: $('.pagehead-actions li a').last().text().trim(),
      commits: $('.commits .num').text().trim(),
      contributors: $('.numbers-summary li .num').last().text().trim()
    });
  }
};

// Functions to find and record select statistics of top users and repos.
var scraper = {
  // Updates top-user-urls.json to reflect the current top 1000 users according to the
  // search query.
  updateUserUrlsJSON: function(callback) { 
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
      return {
        url: 'https://api.github.com/search/users'+config+'&l=&o=desc&ref=advsearch&s=followers&page='+page
      };
    });
    // Gets the 1000 top users, writes them to a .json.
    utils.batchGet(userSearchURLS, utils.parseUserItems, function(error,results) {
      results = _.flatten(results);
      fs.writeFileSync('./leaderboard-data/userUrls/top-user-urls.json',JSON.stringify(results,null,2));
      console.log('updateUserUrlsJSON finished.');
      if (callback) callback();
    });
  },
  // Updates top-user-stats.json to reflect the current stats of the top 1000 users found 
  // found previously.
  updateProfileStatsJSON: function(callback) {
    var profileUrlObjs = JSON.parse(fs.readFileSync('./leaderboard-data/userUrls/top-user-urls.json'));
    // Scrapes statistics from the profile URLs, writes the stats to a .json.
    utils.batchGet(profileUrlObjs, utils.scrapeProfileStats, function(error,results) {
      fs.writeFileSync('./leaderboard-data/userUrls/top-user-stats.json',JSON.stringify(results,null,2));
      console.log('updateProfileStatsJSON finished.');
      if (callback) callback();
    });
  },
  // Updates top-repo-urls.json to reflect the top 20 repos of each language, sorted by stars.
  // The GitHub API limits even authenticated search requests to 20 queries per minute,
  // we use throttledBatchGet with a delay of 3 seconds to get around this. Seeing as we have ~200
  // languages to search for, this will take at least 10 minutes.
  // minStars must be set pretty low because some of the repos of the more esoteric languages
  // have very few stars, even for the top repos.
  updateRepoUrlsJSON: function(callback) {
    var minStars = 1;
    var config = '?client_id=bf7e0962f270bf033f78'
                +'&client_secret=37101e5bd7a17da01dfd4cb4f2889b8371b14388'
                +'&per_page=20&sort=stars&order=desc';
    var repoSearchUrlObjs = _.map(languages, function(language) {
      return {
        url: 'https://api.github.com/search/repositories'+config
            +'&q=language%3A'+encodeURIComponent(language),
        language: language
      };
    });
    utils.throttledBatchGet(repoSearchUrlObjs, utils.parseRepoItems, function(error,results) {
      console.log('updateRepoUrlsJSON finished.');
      if (callback) callback();
    }, 3000);
  },
  // Update top-repo-stats.json to reflect the current stats of the top repos per language.
  updateRepoStatsJSON: function(callback) {
    var repoUrlObjs = _.map(languages, function(language) {
      JSON.parse(fs.readFileSync('./leaderboard-data/repoUrls/top-repo-urls-'+encodeURIComponent(language)+'.json'));
    });
    console.log(repoUrlObjs)
    utils.batchGet(repoUrlObjs, utils.scrapeRepoStats, function(error,results) {
      fs.writeFileSync('./leaderboard-data/top-repo-stats.json',JSON.stringify(results,null,2));
      console.log('updateRepoStatsJSON finished.');
      if (callback) callback();
    });
  }
};

// scraper.updateUserUrlsJSON();
// scraper.updateProfileStatsJSON();
// scraper.updateRepoUrlsJSON();
// scraper.updateRepoStatsJSON();

console.log(_.map(languages, function(language) {
      JSON.parse('./leaderboard-data/repoUrls/top-repo-urls-'+encodeURIComponent(language)+'.json');
    }))
// console.log(JSON.parse(fs.readFileSync('leaderboard-data/repoUrls/top-repo-urls-'+encodeURIComponent('dengis')+'.json')))


module.exports = scraper;

