var Session = require('express-session');
var MongoStore = require('connect-mongo')(Session);
var passport = require('passport');
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require('./config');
var userService = require('./../services/userService');
var User = require('./../models/User');

module.exports.init = function (app) {
	var session = module.exports.session = Session({
		secret: '64ec1dff67add7c8ff0b08e0b518e43c',
		resave: false,
		saveUninitialized: true,
		collection: 'bunker_sessions',
		store: new MongoStore({
			url: 'mongodb://' + config.db.host + ':' + config.db.port + '/' + config.db.session
		})
	});

	app.use(session);

	app.use(passport.initialize());
	app.use(passport.session());

	// what is this doing
	passport.serializeUser(function (user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		User.findById(id).exec(done);
	});

	passport.use(new GoogleStrategy({
		clientID: config.google.clientID,
		clientSecret: config.google.clientSecret,
		callbackURL: config.url + '/auth/googleReturn'
	}, loginCallback));

	function loginCallback(accessToken, refreshToken, profile, done) {
		userService.findOrCreateBunkerUser(profile).nodeify(done);
	}

	return session;
};

