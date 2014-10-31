var MongoClient = require('mongodb').MongoClient;
var assert = require('assert');

var url = process.env.MONGO_URL_SESSION || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/bunker_sessions';


module.exports = new function() {
	var self = this;

	this.db;

	this.connect = function (cb) {
		MongoClient.connect(url, function (err, db) {
			assert.equal(null, err);
			console.log("Connected to " + url);

			self.db = db;

			cb(db);
		});
	};
};

