'use strict';

// app dependencies
const express = require('express');
const superagent = require('superagent');

// load environment variables
// require ('dotenv').config();

// app setup
const PORT = process.env.PORT || 4000;
const app = express();

// application middleware
app.use(express.urlencoded({extended:true}));
app.use(express.static('public'));
app.use(express.static('public/styles'))

// set view
app.set('view engine', 'ejs')

// view routes
app.get('/', (request, response) => {
  response.render('pages/index');
})


//api routes



//catchall
app.get('*', (request, response) => response.status(404).send('This route does not exist.'));







// listening
app.listen(PORT, () => console.log(`Listening on ${PORT}`));
