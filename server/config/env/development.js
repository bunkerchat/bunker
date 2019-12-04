var config = module.exports;

config.environment = "development";

// when doing dev on real ios device, switch this line to your current
// ip address. Then login to https://console.cloud.google.com/apis/credentials?project=celtic-defender-718
// using "bunkerjschat" login, go to "OAuth 2.0 client IDs", then "Development" add "http://192.168.1.27.xip.io:9002"
// to "Authorized JavaScript origins" and "http://192.168.1.27.xip.io:9002/auth/googleReturn" to Authorized redirect URIs

// config.url = "http://192.168.1.27.xip.io:9002";

config.url = "http://localhost:9002";

config.db = {
	host: "localhost",
	name: "bunker",
	session: "bunker_sessions",
	port: "27017"
};

config.express = {
	hostName: "localhost",
	port: 9002,
	ip: "127.0.0.1"
};

config.google = {
	clientID: "744915257573-ri8suktjsu5s1b3jddkacm6k0a45vi02.apps.googleusercontent.com",
	clientSecret: "PvaKpOF_Uh9MrJ-506YoOO9r",
	cse_id: "018153030878338156363:umvujbgdj6s",
	cse_key: "AIzaSyADOhR5rYXCoBHR5fWRw0LB5r6Myp6atME"
};

config.bingApiKey = "WOz19RNOpvm7kP+Xwc1zhz23Oemq9Jhdcs5+xvbjxKY";

config.consoleLogLevel = "debug";
config.buildSassAtRuntime = true;
config.useJavascriptBundle = false;

config.showServerErrors = true;
config.useRedis = false;
