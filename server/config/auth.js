var Session = require("express-session");
var MongoStore = require("connect-mongo")(Session);
var passport = require("passport");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
var GooglePlusStrategy = require("passport-google-plus");
var LocalStrategy = require("passport-local").Strategy;

//var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var config = require("./config");
var userService = require("./../services/userService");
var User = require("./../models/User");

var auth = module.exports;

auth.init = function(app) {
	var session = (auth.session = Session({
		secret: "64ec1dff67add7c8ff0b08e0b518e43c",
		resave: false,
		saveUninitialized: true,
		collection: "bunker_sessions",
		store: new MongoStore({
			url: "mongodb://" + config.db.host + ":" + config.db.port + "/" + config.db.session
		})
	}));

	app.use(session);

	app.use(passport.initialize());
	app.use(passport.session());

	// what is this doing
	passport.serializeUser(function(user, done) {
		done(null, user._id.toString());
	});

	passport.deserializeUser(function(id, done) {
		User.findById(id).exec(done);
	});

	// Google Plus login (Default)
	passport.use(
		new GooglePlusStrategy(
			{
				clientId: config.google.clientID,
				clientSecret: config.google.clientSecret
			},
			loginCallback
		)
	);

	function loginCallback(tokens, profile, done) {
		userService.findOrCreateBunkerUser(profile).nodeify(done);
	}

	app.post("/auth/googleCallback", passport.authenticate("google"), function(req, res) {
		req.session.googleCredentials = req.authInfo;
		res.json({});
	});

	// Google OAuth Login - Secondary
	passport.use(
		new GoogleStrategy(
			{
				clientID: config.google.clientID,
				clientSecret: config.google.clientSecret,
				callbackURL: config.url + "/auth/googleReturn",
				scope: "https://www.googleapis.com/auth/userinfo.email"
			},
			function(accessToken, refreshToken, profile, cb) {
				userService.findOrCreateBunkerUser(profile).nodeify(cb);
			}
		)
	);

	app.get("/login/google", function(req, res) {
		req.session.directTo = req.query.directTo;
		passport.authenticate("google")(req, res);
	});

	app.get("/auth/googleReturn", passport.authenticate("google"), function(req, res) {
		req.session.googleCredentials = req.authInfo;
		res.redirect(req.session.directTo ? req.session.directTo : "/");
	});

	// Local login - In Progress
	passport.use(
		new LocalStrategy(function(username, password, done) {
			User.findOne({ email: username }, function(err, user) {
				if (err) {
					return done(err);
				}
				if (!user) {
					console.log("failed login - no user", { message: "Incorrect username.", username, password });
					return done(null, false, { message: "Incorrect username." });
				}
				if (user._doc.plaintextpassword != password) {
					console.log("failed login - bad password", { message: "Incorrect username.", username, password });
					return done(null, false, { message: "Incorrect password." });
				}
				return done(null, user);
			});
		})
	);

	auth.authenicateLocal = passport.authenticate("local", {
		successRedirect: "/",
		failureRedirect: "/loginBasic"
	});

	return session;
};
