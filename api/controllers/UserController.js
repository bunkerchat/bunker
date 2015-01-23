/**
 * UserController
 *
 * @description :: Server-side logic for managing users
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';
var moment = require('moment');

// Activity update route. This will respond to PUT /user/current/activity
// This route only allows updates to present and typingIn.
// It can only be called by the current user.
// It's sole purpose is to enable away and typing notifications.
module.exports.activity = function (req, res) {
	console.log('activity')
	var userId = req.session.userId;

	// Only allow updates for the following values
	// There's no need for us to save these in the db, this may change in the future
	var typingIn = req.param('typingIn');
	var present = req.param('present');
	var updates = {
		typingIn: typeof typingIn !== 'undefined' ? typingIn : null,
		present: typeof present !== 'undefined' ? present : true,
		lastActivity: new Date().toISOString()
	};

	User.publishUpdate(userId, updates);
	res.ok(updates);
};

//var pendingTasks = {};
//var connectionUpdateWaitSeconds = 15;

module.exports.connect = function (req, res) {
	var lastConnected, previouslyConnected;

	User.findOne(req.session.userId)
		.then(function (user) {
			lastConnected = user.lastConnected;
			previouslyConnected = user.connected;

			if (!user.sockets) user.sockets = [];
			user.sockets.push(req.socket.id);
			user.connected = true;
			user.lastConnected = new Date().toISOString();
			user.typingIn = null;
			return user.save();
		})
		.then(function (user) {
			User.publishUpdate(user.id, user);

			// Send connecting message, if not previously connected or reconnecting
			if (!previouslyConnected && Math.abs(moment(lastConnected).diff(moment(), 'seconds')) > userService.connectionUpdateWaitSeconds) {
				RoomService.messageRoomsWithUser(user.id, user.nick + ' is now online');
			}

			// Clear any disconnect messages that haven't gone out yet
			if (userService.pendingTasks[user.id]) {
				clearTimeout(userService.pendingTasks[user.id]);
				userService.pendingTasks[user.id] = null;
			}
			console.log('connected user: ', user.id);

			// ARS wasn't seeing a data object, so return an empty one?
			res.ok({});
		})
		.catch(res.serverError);
};