/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.bootstrap.html
 */

var moment = require('moment');
var Promise = require('bluebird');
var express = require('../node_modules/sails/node_modules/express'),
	passport = require('passport'),
//GoogleStrategy = require('passport-google-oauth2').Strategy,
//	GoogleStrategy = require('./passport-google-oauth2');
	GooglePlusStrategy = require('passport-google-plus');

module.exports.http = {
	customMiddleware: function (app) {
		app.use(express.compress());
		app.use('/assets', express.static(__dirname + '/../assets/'));

		app.post('/auth/googleCallback', passport.authenticate('google'), function (req, res) {
			req.session.googleCredentials = req.authInfo;
			// Return user profile back to client
			res.send(req.user);
		});
	}
};


module.exports.bootstrap = function (cb) {

	// Clear user socket data
	Promise.resolve(User.update({}, {sockets: [], connected: false, typingIn: null}));

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findOne({id: id}, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new GooglePlusStrategy({
			clientId: sails.config.google.clientID,
			clientSecret: sails.config.google.clientSecret
		},
		function (tokens, profile, done) {
			var email = profile.emails[0].value;
			User.findOne({email: email}).exec(function (error, user) {
				if (user) {
					done(error, user);
				}
				else {
					User.create({
						// when no display name, get everything before @ in email
						nick: (profile.displayName || email.replace(/@.*/, "")).substr(0, 20),
						email: email
					}).exec(done);
				}
			});
		}
	));

	cb();
};
