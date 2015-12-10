var config = module.exports;

config.environment = 'development';

config.url = 'http://localhost:9002';

config.db = {
	host: 'localhost',
	name: 'bunker',
	session: 'bunker_sessions',
	port: '27017'
};

config.express = {
	hostName: 'localhost',
	port: 9002,
	ip: '127.0.0.1'
};

config.google = {
	clientID: '744915257573-ri8suktjsu5s1b3jddkacm6k0a45vi02.apps.googleusercontent.com',
	clientSecret: 'Gm4OujzY9YLyFUWYeaNE-o48'
};


config.consoleLogLevel = 'debug';
config.cacheLess = false;
config.useJavascriptBundle = false;

config.showServerErrors = true;
config.useSocketioRedis = false;
