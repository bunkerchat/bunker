var config = module.exports;

config.environment = "production";
config.url = "https://bunkerchat.net";

config.db = {
	host: "localhost",
	name: "bunker",
	session: "bunker_sessions",
	port: "27017"
};

config.express = {
	hostName: "localhost",
	port: 8080,
	ip: "0.0.0.0"
};

config.google = {
	clientID: process.env.google_clientID,
	clientSecret: process.env.google_clientSecret,
	cse_id: process.env.google_cse_id,
	cse_key: process.env.google_cse_key
};

config.bingApiKey = process.env.bing_api_key;

config.consoleLogLevel = "info";
config.buildSassAtRuntime = false;
config.useJavascriptBundle = true;

config.showServerErrors = false;
config.useRedis = true;
