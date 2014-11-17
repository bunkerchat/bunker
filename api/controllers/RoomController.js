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

// POST /room
// Create a room
module.exports.create = function (req, res) {
	var userId = req.session.userId;
	var name = req.param('name') || 'Untitled';

	// Create new instance of model using data from params
	Room.create({name: name}).exec(function (err, room) {

		// Make user an administrator
		RoomMember.create({room: room.id, user: userId, role: 'administrator'}).exec(function (error, roomMember) {
			RoomMember.publishCreate(roomMember);

			// WARNING
			// Do not publishCreate of this room, it will go to all users who's client will then join it

			res.status(201);
			res.ok(room.toJSON());
		});
	});
};

// Find a single room, this will respond for GET /room/:roomId
// This acts as the room join for now
// TODO should be /room/:id/join
module.exports.findOne = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var userId = req.session.userId;

	Room.findOne(pk).exec(function (err, room) {
		if (err) return res.serverError(err);
		if (!room) return res.notFound();

		res.ok(room); // Can return the room info immediately; perform the subscriptions asynchronously below

		// Subscribe the socket to message and updates of this room
		// Socket will now receive messages when a new message is created
		Room.subscribe(req, pk, ['message', 'update']);
		RoomMember.subscribe(req, ['create', 'destroy']); // TODO seems like an information leak, but ARS won't get messages without it

		// Lookup all current room members of this room
		RoomMember.find().where({room: pk}).exec(function (err, roomMembers) {

			var tasks = []; // Tasks needed to join this member to the room (will be none if they are already a member)
			if (!_.find(roomMembers, {user: userId})) { // Do we need to add as a member?
				tasks.push(function (cb) { // If so, add it to our list of tasks

					RoomMember.create({room: pk, user: userId}).exec(function (err, roomMember) {
						if (!err && roomMember) {
							RoomMember.publishCreate(roomMember);
						}
						cb(err, roomMember);
					});
				});
			}

			async.series(tasks, function (err) { // Complete all tasks then
				if (err) return res.serverError(error);

				// Subscribe the new user to every existing user
				_.each(roomMembers, function (member) {
					User.subscribe(req, member.user, ['message', 'update']);
				});

				// Subscribe all of the existing subscribers to this new user
				_.each(Room.subscribers(pk, 'update'), function (subscriber) {
					User.subscribe(subscriber, userId, ['message', 'update']);
				});
			});

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

		// Unsubscribe socket from this room
		Room.unsubscribe(req, pk, ['message', 'update']);
		// TODO unsubscribe all members? probably not... need to figure out which ones

		// Remove room membership
		RoomMember.destroy({room: pk, user: userId}).exec(function (err, destroyedRecords) {
			_.each(destroyedRecords, function (destroyed) {
				RoomMember.publishDestroy(destroyed.id);
				RoomMember.retire(destroyed);
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
