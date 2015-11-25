var express = require('express');
var app = express();
//var session = require('express-session');
var path = require('path');
//var MongoStore = require('connect-mongo')(session);
var bodyParser = require('body-parser');
var auth = require('./auth');
var config = require('./config');

//app.set('env', config.isProduction ? 'production' : 'development');

//var bootstrapPath = path.join('bower_components', 'bootstrap');
app.use(require('compression')());

app.use('/assets',express.static('assets'));

//app.use(session({
//	secret: '64ec1dff67add7c8ff0b08e0b518e43c',
//	resave: false,
//	saveUninitialized: true,
//	store: new MongoStore({
//		url: 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.name
//	})
//}));

app.set('view engine', 'ejs');
app.set('views', './server/views');
app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({extended: false}));

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
