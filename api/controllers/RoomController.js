/* global User, Room, _, actionUtil, require */

/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

'use strict';

var moment = require('moment');
var actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

// Find a single room, this will respond for GET /room/:roomId
// This acts as the room join for now
// TODO should be /room/:id/join
exports.findOne = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Room.findOne(pk).populate('members').exec(function (error, room) {
		if (error) return res.serverError();
		if (!room) return res.notFound();

		// Subscribe the socket to message and updates of this room
		// Socket will now receive messages when a new message is created
		Room.subscribe(req, pk, ['message', 'update']);
		_.each(room.members, function (member) {
			User.subscribe(req, member.id, ['message', 'update']); // Subscribe to member updates
		});

		// If user is not a member, add them and publish update
		if (!_.any(room.members, {id: userId})) {
			room.members.add(userId);
			room.save(function () {

				User.findOne(userId).populateAll().exec(function (error, populatedUser) {
					User.publishUpdate(userId, populatedUser);
				});

				// Repopulate the room, with the new member, and publish a room update
				Room.findOne(pk).populate('members').exec(function (error, room) {
					Room.publishUpdate(room.id, room);
					res.ok(room);
				});
			});
		}
		else {
			res.ok(room);
		}
	});
};

// PUT /room/:id/leave
// Current user requesting to leave a room
exports.leave = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Room.findOne(pk).populate('members').exec(function (error, room) {
		if (error) return res.serverError();
		if (!room) return res.notFound();

		// Unsubscribe socket for this room
		Room.unsubscribe(req, pk, ['message', 'update']);
		// TODO unsubscribe all members? probably not... need to figure out which ones

		// Remove from room member list
		room.members = _.reject(room.members, {id: userId});
		room.save(function () {

			User.findOne(userId).populateAll().exec(function (error, populatedUser) {
				populatedUser.rooms = _.reject(populatedUser.rooms, {id: room.id});
				populatedUser.save();
				User.publishUpdate(userId, populatedUser);
			});

			// Publish a room update
			Room.publishUpdate(room.id, room);
			res.ok(room);
		});
	});
};

// GET /room/:id/latest
// Get the latest 50 messages of a room
exports.latest = function (req, res) {
	var roomId = actionUtil.requirePk(req);
	// TODO check for roomId and user values

	// find finds multiple instances of a model, using the where criteria (in this case the roomId
	// we also want to sort in DESCing (latest) order and limit to 50
	// populateAll hydrates all of the associations
	Message.find().where({room: roomId}).sort('createdAt DESC').limit(50).populateAll().exec(function (error, messages) {
		res.ok(messages); // send the messages
	});
};

// GET /room/:id/history
// Get historical messages of a room
exports.history = function (req, res) {
	var roomId = actionUtil.requirePk(req);
	var startDate = req.param('startDate');
	var endDate = req.param('endDate');

	Message.find({room: roomId, createdAt: {'>': moment(startDate).toDate(), '<': moment(endDate).toDate()}})
		.populate('author')
		.exec(function (err, messages) {
			if (err) return res.serverError(err);
			res.ok(messages);
		});
};
