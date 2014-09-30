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
	GoogleStrategy = require('passport-google-oauth').OAuth2Strategy,
	LocalStrategy = require('passport-local').Strategy;

module.exports.bootstrap = function (cb) {

	passport.serializeUser(function (user, done) {
		done(null, user.id);
	});

	passport.deserializeUser(function (id, done) {
		User.findOne({id: id}, function (err, user) {
			done(err, user);
		});
	});

	passport.use(new LocalStrategy(
		function(username, password, done) {
			User.findOne({ username: username }, function(err, user) {
				if (err) { return done(err); }
				if (!user || !user.validPassword(password)) {
					return done(null, false, { message: 'Incorrect username or password' });
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
			User.findOne({token: accessToken}).exec(function (error, user) {
				if (user) {
                    done(error, user);
				}
                else {
                    User.create({
                        token: accessToken,
                        nick: profile.displayName,
                        email: profile.emails[0].value
                    }).exec(function (error, user) {
                        done(error, user);
                    });
                }
			});
		}
	));

	cb();
};
