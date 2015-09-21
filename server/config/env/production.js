var config = module.exports;

config.environment = 'production';
config.isProduction = true;
config.url = 'http://bunkerchat.net';

config.db = {
	host: 'localhost',
	name: 'bunker',
	session: 'bunker_sessions',
	port: '27017'
};

config.express = {
	hostName: 'localhost',
	port: 9002,
	ip: '0.0.0.0'
};

config.google = {
	clientID: process.env.google_clientID,
	clientSecret: process.env.google_clientSecret
};

config.consoleLogLevel = 'error';
config.cacheLess = true;
config.useJavascriptBundle = true;