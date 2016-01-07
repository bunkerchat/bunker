var cache_manager = require('cache-manager');

var oneDay =
	60 /*seconds*/
	* 60 /*minutes*/
	* 24 /*hours*/;

var oneMinute = 60;

var longCache = cache_manager.caching({store: 'memory', max: 100, ttl: oneDay});
var shortCache = cache_manager.caching({store: 'memory', max: 100, ttl: oneMinute});

module.exports = {
	long: longCache,
	short: shortCache
};
