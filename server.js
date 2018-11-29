'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');

// load environment variables from .env files
require ('dotenv').config(); //note to self: have to run npm i dotenv so this doesn't error when you nodemon

// app setup
const PORT = process.env.PORT;
const app = express();

// application middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

// set view
app.set('view engine', 'ejs')



function handleError(err, res) {
  console.error(err);
  if (res) res.status(404).render('pages/error');
}

//api routes
// renders the search form
app.get('/', newSearch);

//Creates a new search to the Google book API
app.post('/searches', createSearch);


//catchall
app.get('*', (request, response) => response.status(404).send('This route does not exist.'));

// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//Helper Functions
function newSearch (req, res) {
  res.render('pages/index');
}

//constructors/models
function Book(info) {
  this.image_url = info.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg' ;
  this.title = info.title || 'No title available';
  this.author = info.authors || 'No author listed';
  this.description = info.description || 'No summary provide';
  this.isbn = info.industryIdentifiers[0].identifier || 'No ISBN available';
  console.log('THIS ojbect', this);
}

function createSearch (req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  // console.log('request', req.body);
  // console.log('requested search', req.body.search);

  //we get an array back from search page of [search words , search value] ie [puppies, title], that is why we used [1] and [0]
  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => res.render('pages/searches/show', {searchResults: results}))
    .catch(error => handleError(error, res));
}

