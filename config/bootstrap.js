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

var passport = require('passport'),
	GoogleStrategy = require('passport-google').Strategy;

module.exports.bootstrap = function (cb) {

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findOne({id: id}, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new GoogleStrategy({
			returnURL: sails.getBaseurl() + '/auth/googleReturn',
			realm: sails.getBaseurl()
		},
		function (identifier, profile, done) {
			User.findOne({openId: identifier}).exec(function (error, user) {
				if (user) {
					done(error, user);
					return;
				}

				User.create({
					openId: identifier,
					nick: profile.displayName,
					email: profile.emails[0].value
				}).exec(function (error, user) {
					done(error, user);
				});
			});
		}
	));

	// It's very important to trigger this callback method when you are finished
	// with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
	cb();
};
