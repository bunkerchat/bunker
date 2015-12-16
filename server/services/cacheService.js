var cache_manager = require('cache-manager');

var oneDay =
	60 /*seconds*/
	* 60 /*minutes*/
	* 24 /*hours*/;

var oneMinute = 60;

var fourHours =
	60 /*seconds*/
	* 60 /*minutes*/
	* 4 /*hours*/;

module.exports = {
	oneDay: cache_manager.caching({store: 'memory', max: 100, ttl: oneDay}),
	oneMinute: cache_manager.caching({store: 'memory', max: 100, ttl: oneMinute}),
	fourHours: cache_manager.caching({store: 'memory', max: 100, ttl: fourHours})
};
