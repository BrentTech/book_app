'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// load environment variables from .env files
require ('dotenv').config();

// app setup
const PORT = process.env.PORT;
const app = express();

// application middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));

//middleware to handle PUT and DELETE
app.use(methodOverride((request, response) => {
  if (request.body && typeof request.body === 'object' && '_method' in request.body) {
    // look in urlencoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// set view
app.set('view engine', 'ejs')

//database setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));


function handleError(err, res) {
  console.error(err);
  res.render('pages/error', {error: err});
}

//api routes
app.get('/', homePage);
app.get('/book/:book_id', getDetail);
app.get('/new_search', newSearch);
// app.get('/add', showForm); //i showForm will be the jquery to unhide the attribute
app.post('/searches', createSearch);
app.post('/add', addBook);
app.put('/update/:book_id',updateBook);


//catchall
app.get('*', (request, response) => response.status(404).send('This route does not exist.'));

// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//Helper Functions
function newSearch (req, res) {
  res.render('pages/searches/new');
}

function homePage (req, res) {
  let SQL = 'SELECT * FROM saved_book_table;';

  return client.query(SQL)
    .then(results => {
      // console.log(results.rows.length)
      res.render('pages/index', {results: results.rows})
    })
    // .then(results => res.render('pages/index', {bookTotal: results.length}))
    .catch(handleError);
}

function getDetail (req, res) {
  let SQL = 'SELECT * FROM saved_book_table WHERE id=$1;';
  let values = [req.params.book_id];

  return client.query(SQL, values)
    .then( (result) => {
      return res.render('books/detail', {book: result.rows[0]})
    })
    .catch(handleError);
}

// function showForm (req, res) {
//   //code to unhide att
// }

function addBook (req, res) {
  // console.log('made it to addbook function');
  // console.log('req', req);
  // let tempisbn = parseInt(isbn)
  let {title, author, isbn, image_url, description, bookself} = req.body;

  let SQL = 'INSERT INTO saved_book_table(title, author, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [title, author, isbn, image_url, description, bookself];

  return client.query(SQL, values)
    .then(res.redirect('/'))
    .catch(handleError);
}

function updateBook (req, res) {
  let {title, author, isbn, image_url, description, bookself} = req.body;

  let SQL = 'UPDATE saved_book_table SET titl=$1, author=$2, isbn=$3, image_url=$4, description=$5, bookshelf=$6 WHERE id=$7;';
  let values = [title, author, isbn, image_url, description, bookself, req.params.book_id];

  return client.query(SQL, values)
    .then(res.redirect(`/book/${req.params.task_id}`))
    .catch(handleError);
}

//constructors/models
function Book(info) {
  this.image_url = info.imageLinks.thumbnail || 'https://i.imgur.com/J5LVHEL.jpg' ;
  this.title = info.title || 'No title available';
  this.author = info.authors || 'No author listed';
  this.description = info.description || 'No summary provide';
  this.isbn = info.industryIdentifiers[0].identifier || 'No ISBN available';
  // console.log('THIS ojbect', this);
}

function createSearch (req, res) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  //we get an array back from search page of [search words , search value] ie [puppies, title], that is why we used [1] and [0]
  if (req.body.search[1] === 'title') { url += `+intitle:${req.body.search[0]}`; }
  if (req.body.search[1] === 'author') { url += `+inauthor:${req.body.search[0]}`; }

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => res.render('pages/searches/show', {searchResults: results}))
    .catch(error => handleError(error, res));
}



