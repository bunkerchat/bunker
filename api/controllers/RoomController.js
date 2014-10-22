/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

actionUtil = require('../../node_modules/sails/lib/hooks/blueprints/actionUtil');

// Find a single room, this will respond for GET /room/:roomId
// This acts as the room join for now
module.exports.findOne = function (req, res) {
	var pk = actionUtil.requirePk(req);
	var user = req.session.user;

	if (!user) {
		return res.forbidden('No active session/user');
	}

	Room.findOne(pk).exec(function (error, room) {
		if (error) return res.serverError();
		if (!room) return res.notFound();

		// TODO don't add the user if they are already a member of the room, as this causes an error we have to ignore below
		room.members.add(user.id);
		room.save()
			.catch(function () {
			})
			.finally(function () {
				// repopulate and send update
				Room.findOne(room.id).populate('members').exec(function (error, populatedRoom) {
					Room.publishUpdate(populatedRoom.id, populatedRoom);

					// Subscribe the socket to message and updates of this room
					// Socket will now receive messages when a new message is created
					Room.subscribe(req, pk, ['message', 'update']);
					res.ok(populatedRoom);
				});
			});
	});
};
