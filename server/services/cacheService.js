var Promise = require('bluebird');
var cache_manager = require('cache-manager');
var mongoStore = require('cache-manager-mongodb');
var config = require('../config/config');

var cacheService = module.exports;

var mongoCache = {
	store: mongoStore,
	options: {
		host: config.db.host,
		port: config.db.port,
		database: "nodeCacheDb",
		collection: "cacheManager"
	}
};

var oneDay =
	60 /*seconds*/
	* 60 /*minutes*/
	* 24 /*hours*/;

var oneMinute = 60;

var fourHours =
	60 /*seconds*/
	* 60 /*minutes*/
	* 4 /*hours*/;

var fourMonths =
		60 /*seconds*/
		* 60 /*minutes*/
		* 24 /*hours*/
		* 120 /*days*/
	;

cacheService.oneMinute = Promise.promisifyAll(cache_manager.caching({
	store: 'memory',
	max: 100,
	ttl: oneMinute
}));

cacheService.fourHours = Promise.promisifyAll(cache_manager.caching(_.extend({}, mongoCache, {
	max: 1000,
	ttl: fourHours
})));
cacheService.oneDay = Promise.promisifyAll(cache_manager.caching(_.extend({}, mongoCache, {
	max: 10000,
	ttl: oneDay
})));

cacheService.fourMonths = Promise.promisifyAll(cache_manager.caching(_.extend({}, mongoCache, {
	max: 100000,
	ttl: fourMonths
})));
