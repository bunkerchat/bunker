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
	clientSecret: 'Gm4OujzY9YLyFUWYeaNE-o48',
	cse_id: '018153030878338156363:umvujbgdj6s',
	cse_key: 'AIzaSyADOhR5rYXCoBHR5fWRw0LB5r6Myp6atME'
};

config.consoleLogLevel = 'debug';
config.buildSassAtRuntime = true;
config.useJavascriptBundle = false;

config.showServerErrors = true;
config.useSocketioRedis = false;
