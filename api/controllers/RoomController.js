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
module.exports.findOne = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Room.findOne(pk).exec(function (err, room) {
		if (err) return res.serverError(err);
		if (!room) return res.notFound();

		res.ok(room);

		// Subscribe the socket to message and updates of this room
		// Socket will now receive messages when a new message is created
		Room.subscribe(req, pk, ['message', 'update']);
		RoomMember.subscribe(req, ['create', 'destroy']);

		RoomMember.find().where({room: pk}).exec(function (err, members) {

			_.each(members, function (member) {
				User.subscribe(req, member.user, ['message', 'update']); // Subscribe to member updates
			});

			// Do we need to add as a member?
			if (!_.find(members, {user: userId})) {
				RoomMember.create({
					room: pk,
					user: userId
				}).exec(function (err, membership) {
					RoomMember.publishCreate(membership);
				});
			}
		});
	});
};

// PUT /room/:id/leave
// Current user requesting to leave a room
module.exports.leave = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Room.findOne(pk).exec(function (error, room) {
		if (error) return res.serverError();
		if (!room) return res.notFound();

		res.ok(room);

		// Unsubscribe socket for this room
		Room.unsubscribe(req, pk, ['message', 'update']);
		// TODO unsubscribe all members? probably not... need to figure out which ones

		// Remove room membership
		RoomMember.destroy({ room: pk, user: userId }).exec(function(err, destroyedRecords) {
			_.each(destroyedRecords, function(destroyed) {
				RoomMember.publishDestroy(destroyed.id);
			});
		});
	});
};

// GET /room/:id/latest
// Get the latest 50 messages of a room
module.exports.latest = function (req, res) {
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
module.exports.history = function (req, res) {
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
