/* global User, Room, _, actionUtil, require */

/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

// Find a single room, this will respond for GET /room/:roomId
// This acts as the room join for now
module.exports.findOne = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var user = req.session.user;

	if (!user) {
		return res.forbidden('No active session/user');
	}

	Room.findOne(pk).populate('members').exec(function (error, room) {
		if (error) return res.serverError();
		if (!room) return res.notFound();

		// Subscribe the socket to message and updates of this room
		// Socket will now receive messages when a new message is created
		Room.subscribe(req, pk, ['message', 'update']);
		_.each(room.members, function(member) {
			User.subscribe(req, member.id, ['message', 'update']); // Subscribe to member updates
		});

		// If user is not a member, add them and publish update
		if(!_.any(room.members, {id: user.id})) {
			room.members.add(user.id);
			room.save(function() {

				User.findOne(user.id).populateAll().exec(function(error, populatedUser) {
					User.publishUpdate(user.id, populatedUser);
				});

				// Repopulate the room, with the new member, and publish a room update
				Room.findOne(pk).populate('members').exec(function(error, room) {
					Room.publishUpdate(room.id, room);
				});
			});
		}

		res.ok(room);
	});
};
