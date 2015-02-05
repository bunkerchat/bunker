/**
 * Session Configuration
 * (sails.config.session)
 *
 * Sails session integration leans heavily on the great work already done by
 * Express, but also unifies Socket.io with the Connect session store. It uses
 * Connect's cookie parser to normalize configuration differences between Express
 * and Socket.io and hooks into Sails' middleware interpreter to allow you to access
 * and auto-save to `req.session` with Socket.io the same way you would with Express.
 *
 * For more information on configuring the session, check out:
 * http://sailsjs.org/#/documentation/reference/sails.config/sails.config.session.html
 */

var mongoConnectClient = require('./../mongoConnectClient');

//var mongoUrl = process.env.MONGO_URL_SESSION || process.env.MONGOLAB_URI || 'mongodb://localhost:27017/bunker_sessions';
var adapter = 'mongo';

var redisClient;
//if(process.env.NODE_ENV == 'production'){
//	var redis = require('redis');
//	var url = require('url');
//
//	adapter = 'redis';
//	var redisURL = url.parse(process.env.REDISCLOUD_URL);
//	redisClient = redis.createClient(redisURL.port, redisURL.hostname, {no_ready_check: true});
//	redisClient.auth(redisURL.auth.split(":")[1]);
//}

module.exports.session = {

	/***************************************************************************
	 *                                                                          *
	 * Session secret is automatically generated when your new app is created   *
	 * Replace at your own risk in production-- you will invalidate the cookies *
	 * of your users, forcing them to log in again.                             *
	 *                                                                          *
	 ***************************************************************************/
	secret: '64ec1dff67add7c8ff0b08e0b518e43c',


	/***************************************************************************
	 *                                                                          *
	 * Set the session cookie expire time The maxAge is set by milliseconds,    *
	 * the example below is for 24 hours                                        *
	 *                                                                          *
	 ***************************************************************************/

	// cookie: {
	//   maxAge: 24 * 60 * 60 * 1000
	// }

	/***************************************************************************
	 *                                                                          *
	 * In production, uncomment the following lines to set up a shared redis    *
	 * session store that can be shared across multiple Sails.js servers        *
	 ***************************************************************************/

	//adapter: isProd ? 'redis' : 'mongo',

	/***************************************************************************
	 *                                                                          *
	 * The following values are optional, if no options are set a redis         *
	 * instance running on localhost is expected. Read more about options at:   *
	 * https://github.com/visionmedia/connect-redis                             *
	 *                                                                          *
	 *                                                                          *
	 ***************************************************************************/

	client: redisClient,
	// host: 'localhost',
	// port: 6379,
	// ttl: <redis session TTL in seconds>,
	// db: 0,
	// pass: <redis auth password>
	// prefix: 'sess:'


	/***************************************************************************
	 *                                                                          *
	 * Uncomment the following lines to use your Mongo adapter as a session     *
	 * store                                                                    *
	 *                                                                          *
	 ***************************************************************************/

	adapter: adapter,
	//url: mongoUrl + '/bunker_user_sessions'
	db: mongoConnectClient.db,
	// host: 'localhost',
	// port: 27017,
	// db: 'sails',
	collection: 'bunker_sessions'

	/***************************************************************************
	 *                                                                          *
	 * Optional Values:                                                         *
	 *                                                                          *
	 * # Note: url will override other connection settings url:                 *
	 * 'mongodb://user:pass@host:port/database/collection',                     *
	 *                                                                          *
	 ***************************************************************************/

	// username: '',
	// password: '',
	// auto_reconnect: false,
	// ssl: false,
	// stringify: true

};
