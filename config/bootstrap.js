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

var express = require('../node_modules/sails/node_modules/express'),
	passport = require('passport'),
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	LocalStrategy = require('passport-local').Strategy;


module.exports.http = {
	customMiddleware: function (app) {
		app.use(express.compress());
		app.use('/assets', express.static(__dirname + '/../assets/'));
	}
};


module.exports.bootstrap = function (cb) {

	// Clear user socket data
	User.update({}, {sockets: [], connected: false, typingIn: null}).exec(function (error) {
	});

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findOne({id: id}, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new LocalStrategy(
		function (username, password, done) {
			User.findOne({username: username}, function (err, user) {
				if (err) {
					return done(err);
				}
				if (!user || !user.validPassword(password)) {
					return done(null, false, {message: 'Incorrect username or password'});
				}

				return done(null, user);
			});
		}
	));

	passport.use(new GoogleStrategy({
			clientID: sails.config.google.clientID,
			clientSecret: sails.config.google.clientSecret,
			callbackURL: sails.config.url + '/auth/googleReturn'
		},
		function (accessToken, refreshToken, profile, done) {
			var email = profile.emails[0].value;
			User.findOne({email: email}).exec(function (error, user) {
				if (user) {
					User.update(user.id, {token: accessToken}).exec(function (error, user) {
						done(error, user[0]);
					});
				}
				else {
					User.create({
						token: accessToken,
						// when no display name, get everything before @ in email
						nick: profile.displayName || email.replace(/@.*/, ""),
						email: email
					}).exec(function (error, user) {
						done(error, user);
					});
				}
			});
		}
	));

	cb();
};
