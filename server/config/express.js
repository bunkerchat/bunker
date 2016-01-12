var express = require('express');
var app = express();
var path = require('path');
var bodyParser = require('body-parser');
var sassMiddleware = require('node-sass-middleware');
var auth = require('./auth');
var config = require('./config');

app.set('env', config.useJavascriptBundle ? 'production' : 'development');
app.use('/assets', express.static('assets'));
app.use('/node_modules', express.static('node_modules'));
app.set('view engine', 'ejs');
app.set('views', './server/views');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

auth.init(app);

// system level responses
app.use(require('../responses/serverError'));
app.use(require('../responses/ok'));
app.use(require('../responses/notFound'));
app.use(require('../responses/badRequest'));

// setup routes
require('./routes').http(app);

// Export the app instance for unit testing via supertest
module.exports = app;
