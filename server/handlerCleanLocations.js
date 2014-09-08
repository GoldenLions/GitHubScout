// In order to show Github user by location data on the homepage, 
// the date from Github Archives needs to be manually normalized. 
// The code currenlty normalizes the data, but it doesn't run automatically.
// You have to manually run cleanLocations.js

var bodyParser = require('body-parser');
var Promise = require('bluebird');
var _ = require('lodash');

var db = require('../app/config');
var Cities = require('../app/collections/cities');
var City = require('../app/models/city');
var State = require('../app/models/state');
var States = require('../app/collections/states');
var Countries = require('../app/collections/countries');
var Country = require('../app/models/country');
var GithubLocation = require('../app/models/githublocation');
var GithubLocations = require('../app/collections/githublocations');


var handler = {};

// Since Github user put different types of information in their location, 
// we need to normalize the data and turn to Github locations into city,
// state, country whenever possible.

handler.resetDraft = function() {
  db.knex('github_locations')
    .where({draft: 1})
    .update({ draft: 0})
    .then(console.log('update draft'))
};


// Update country for records whose Github locations only list a country.
handler.setCountryOnly = function(){
  // select all countries in countries table
  Countries.query()
    .select('country', 'iso', 'iso3')

    // for each country, update the country field for all Github records that  
    // list the country as their location
    .map(function(country){
      console.log(country);
      db.knex('github_locations')
        .whereNull('part2')
        .andWhere( function() {
          this.where('part1', country['iso'])
          .orWhere('part1', country['iso3'])
          .orWhere('part1', country['country'])
        })
        .andWhere('draft', 0)
        .update({country: country['country'], draft: 1})
        .then(console.log('update country'));
    });
};


// Update state and country for records whose Github locations only list a USA state.
handler.setStateOnly = function(){
  // select all states in states table
  States.query()
    .select('state', 'abbr')

    // for each state
    .map(function(state){
      console.log(state);

      //update the state and country field for all Github locations that  
      // list the state as their location
      db.knex('github_locations')
        .whereNull('part2')
        .andWhere( function() {
          this.where('part1', state['state'])
          .orWhere('part1', state['abbr'])
        })
        .andWhere('draft', 0)
        .update({state: state['state'], country: 'United States', draft: 1})
        .then(console.log('update state'));

      //update the state and country field for all Github locations that  
      // list the state  and United states as their location
      db.knex('github_locations')
        .where( function() {
          this.where('part1', state['state'])
          .orWhere('part1', state['abbr'])
        })
        .andWhere( function() {
          this.where('part2', 'US')
          .orWhere('part2', 'United States')
          .orWhere('part2', 'USA')
          .orWhere('part2', 'DC')
        })
        .andWhere('draft', 0)
        .update({state: state['state'], country: 'United States', draft: 1})
        .then(console.log('update state US'));

    });
};


handler.setCityOnly = function(){
  // There are multipLe cites that share the same name. (cities.duplicates = 1)
  // To avoid picking duplicate city names, select all cities  that
  // 1) only appear in the cities table once 
  // or 2) have a population over 1/2 million
  db.knex('cities')
    .join('countries', 'cities.country_code', 'countries.iso')
    .leftJoin('states', 'cities.admin', 'states.abbr')
    .select('cities.name as city', 'cities.asciiname as cityAlt' ,
      'countries.country', 'countries.iso', 'countries.iso3',
      'states.state', 'states.abbr')
    .where('cities.duplicate', 0)
    .orWhere('cities.population', '>', '500000')
  
    // .limit(10)

    //for each city
    .map(function(place){
      console.log(place);

      //update the city, state and country field for all Github locations   
      db.knex('github_locations')
        // Github location that list the city as their location
        .where(function(){
          this.whereNull('part2')
          .andWhere(function(){
            this.where('part1', place['city'])
            .orWhere('part1', place['cityAlt'])
          })
        })

        .andWhere('draft', 0)
        .update({city: place['city'], state: place['state'], country: place['country'], draft: 1})
        .then(console.log('update city'));

    })

};


handler.setCity = function(){
  // select all cities in cities table
  db.knex('cities')
    .join('countries', 'cities.country_code', 'countries.iso')
    .leftJoin('states', 'cities.admin', 'states.abbr')
    .select('cities.name as city', 'cities.asciiname as cityAlt' ,
      'countries.country', 'countries.iso', 'countries.iso3',
      'states.state', 'states.abbr')
    // .limit(10)

    //for each city
    .map(function(place){
      // console.log(place)

      //update the city, state and country field for all Github locations   
      db.knex('github_locations')

        // Github location that list the city, state as their location
        .where(function(){
          this.where(function(){
            this.where('part1', place['city'])
            .orWhere('part1', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part2', place['state'])
            .orWhere('part2', place['abbr'])
          })
        })

        // Github location that list the city, country as their location
        .orWhere(function(){
          this.where(function(){
            this.where('part1', place['city'])
            .orWhere('part1', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part2', place['country'])
            .orWhere('part2', place['iso'])
            .orWhere('part2', place['iso3'])
          })
        })

        // Github location that list the xxx, city, country as their location
        .orWhere(function(){
          this.where(function(){
            this.where('part2', place['city'])
            .orWhere('part2', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part3', place['country'])
            .orWhere('part3', place['iso'])
            .orWhere('part3', place['iso3'])
          })
        })

        // Github location that list the city, xxx, country as their location
        .orWhere(function(){
          this.where(function(){
            this.where('part1', place['city'])
            .orWhere('part1', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part3', place['country'])
            .orWhere('part3', place['iso'])
            .orWhere('part3', place['iso3'])
          })
        })
        .andWhere('draft', 0)
        .update({city: place['city'], state: place['state'], country: place['country'], draft: 1})
        .then(console.log('update city'));

    })

};


handler.setCityReverse = function(){
  // select all cities in cities table
  db.knex('cities')
    .join('countries', 'cities.country_code', 'countries.iso')
    .leftJoin('states', 'cities.admin', 'states.abbr')
    .select('cities.name as city', 'cities.asciiname as cityAlt' ,
      'countries.country', 'countries.iso', 'countries.iso3',
      'states.state', 'states.abbr')
    // .where('name','Duisburg')
    // .limit(10)

    //for each city
    .map(function(place){
      // console.log(place)

      //update the city, state and country field for all Github locations   
      db.knex('github_locations')
        // Github location that list the city as their location

        // Github location that list the country, xxx, city as their location
        .where(function(){
          this.where(function(){
            this.where('part3', place['city'])
            .orWhere('part3', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part1', place['country'])
            .orWhere('part1', place['iso'])
          })
        })
        // Github location that list the country, city as their location
        .orWhere(function(){
          this.where(function(){
            this.where('part2', place['city'])
            .orWhere('part2', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part1', place['country'])
            .orWhere('part1', place['iso'])
          })
        })

        // Github location that list the xxx, country, city as their location
        .orWhere(function(){
          this.where(function(){
            this.where('part3', place['city'])
            .orWhere('part3', place['cityAlt'])
          })
          .andWhere(function(){
            this.where('part2', place['country'])
            .orWhere('part2', place['iso'])
          })
        })

        .andWhere('draft', 0)
        .update({city: place['city'], state: place['state'], country: place['country'], draft: 1})
        .then(console.log('update city'));

    })
};


// takes locations from Github and splits them into parts
handler.splitLocations = function(){
  // select every distinct Github location 
  GithubLocations.query()
    .distinct('location')
    .where({draft : 0})

    // for every location
    .map(function(location){
      console.log(location);

      var parts = [];
      var updateParts = {};
      var isUrl = false;

      // split the location into parts by comma or slash if location isn't an url
      if(location['location'].indexOf('http') === -1) {
        parts = location['location'].split(/ ?[,\/] ?/);  
      } else {
        isUrl = true;
      }

      // store each part in an object if location is not a url. The number of 
      // parts for each location  can vary from 1 to 3.  
      if(!isUrl && parts.length === 0){
        updateParts = {part1: location, draft: 1};
      } else if(parts.length === 1 ){
        updateParts = {part1: parts[0], draft: 1};
      } else if (parts.length === 2) {
        updateParts = {part1: parts[0], part2: parts[1], draft: 1};
      } else if (parts.length >= 3) {
        updateParts = {part1: parts[0], part2: parts[1], part3: parts[2], draft: 1};
      }

      // update the parts for the location
      db.knex('github_locations')
        .where('location', location['location'])
        .andWhere('draft', 0)
        .update(updateParts)
        .then(console.log('update parts'));
          
    });
};


module.exports = handler;
