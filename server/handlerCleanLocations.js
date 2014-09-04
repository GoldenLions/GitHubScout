var bodyParser = require('body-parser');

var db = require('../app/config');
var Cities = require('../app/collections/cities');
var City = require('../app/models/city');
var Countries = require('../app/collections/countries');
var Country = require('../app/models/country');
var GithubLocation = require('../app/models/githublocation');
var GithubLocations = require('../app/collections/githublocations');


var handler = {};


// // Fetches and returns the name and ISO initials for all countries.
// handler.fetchCountries = function(){
//   console.log('fetchCountries');
//   // using query() instead of fetch() so that we can limit the number 
//   // of records selected.
//   Countries.query()
//     .limit(1)
//     .select('country', 'iso', 'iso3')
//     .then(function(countries){

//       // console.log('countries', countries);
//       countries.forEach(function(country){
//         for(var key in country){
//           console.log(country[key]);
//           // using query() instead of fetch() so that we can limit the number 
//           // of records selected.
//           GithubLocations.query()
//             // .whereNull('country')
//             // .limit(1)
//             .where({github_location: country[key]})
//             .select()
//             .then(function(locations){
//               console.log('locations', locations);

//               // foreach github location, set the country field to targetCountry
//               locations.forEach(function(location){
//                 console.log('loc....',location);
//                 updateGithubLocation(location);
//               })

//             });
//         }
//       })

//     });
// };



// Fetches and returns the name and ISO initials for all countries.
handler.fetchCountries = function(){
  var names = [];

  console.log('fetchCountries');
  // using query() instead of fetch() so that we can limit the number 
  // of records selected.
  Countries.query()
    .limit(10)
    .select('country', 'iso', 'iso3')
    .then(function(countries){

      // console.log('countries', countries);
      countries.forEach(function(country){
        for(var key in country){
          // console.log(country[key]);
          // names.push(country[key]);
          
          handler.fetchGithubLocations(country[key]);

        }
      });
    });
};

// Get all Github locations that match the target location.
handler.fetchGithubLocations = function(targetLocation) {
  console.log('fetchGithubLocations', targetLocation);

  // using query() instead of fetch() so that we can limit the number 
  // of records selected.
  GithubLocations.query()
    .whereNull('country')
    .where({github_location: targetLocation})
    .limit(3)
    .select()
    .then(function(locations){
      console.log('locations', locations);

      // foreach github location, set the country field to targetCountry
      locations.forEach(function(location){
        console.log('test.......')
        updateGithubLocation(targetLocation);
      })

    });
}

var updateGithubLocation = function(targetLocation){
  console.log('updateGithubLocation', targetLocation);

  new GithubLocation({github_location: targetLocation})
    .save({country: targetLocation}, {patch: true})
    .then(function(githubLocation){
      console.log('sucess', targetLocation);
    });
}



// 
// var insertCountry = 

module.exports = handler;
