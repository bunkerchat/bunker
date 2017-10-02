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
	passport.serializeUser(function (user, done) {
		done(null, user._id);
	});

	passport.deserializeUser(function (id, done) {
		User.findOne({_id: id}, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new GooglePlusStrategy({
		clientId: sails.config.google.clientID,
		clientSecret: sails.config.google.clientSecret
	}, authenticateUser));

	// Clear user socket data
	Promise.join(
		User.update({}, {sockets: [], connected: false, typingIn: null}),
		ensureFirstRoom()
	)
		.nodeify(cb);
};

function ensureFirstRoom() {
	return Room.findOne({name: 'First'})
		.then(function (firstRoom) {
			if (!firstRoom) return Room.create({name: 'First'});
		})
}

function authenticateUser(tokens, profile, done) {
	var email = profile.emails[0].value;
	var user, room;

	return User.findOne({email: email})
		.then(function (dbUser) {
			if (dbUser) return dbUser;

			return Promise.join(
				User.create({
					// when no display name, get everything before @ in email
					nick: (profile.displayName || email.replace(/@.*/, "")).substr(0, 20),
					email: email
				}),
				Room.findOne({name: 'First'})
			)
				.spread(function (dbUser, dbRoom) {
					user = dbUser;
					room = dbRoom;

					return Promise.join(
						User.count({}),
						RoomMember.create({room: room._id, user: user._id})
					);
				})
				.spread(function (userCount, roomMember) {
					if(userCount > 1) return;

					// if starting bunker for the first time, make the first logged in user admin of first room
					roomMember.role = 'administrator';
					return roomMember.save();
				})
				.then(function () {
					return user;
				})

		})
		.nodeify(done);
}
