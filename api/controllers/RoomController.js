/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports.connectedMembers = function (req, res) {

};

// Find a single room, this will respond for GET /room/:roomId
// This acts as the room join for now
module.exports.findOne = function (req, res) {
	var roomId = req.param('id');
	var user = req.session.user;
	// TODO check for roomId and user values

	Room.findOne(roomId).exec(function (error, room) {
		if (error) res.serverError();
		if (!room) res.notFound();

		// always try to add room members
		room.members.add(user.id);
		room.save(function (memberAddError, updatedRoom) {
			// repopulate and send update
			Room.findOne(room.id).populateAll().exec(function (error, populatedRoom) {
				Room.publishUpdate(populatedRoom.id, populatedRoom);
			});
		});

		// Subscribe the socket to message and updates of this room
		// Socket will now receive messages when a new message is created
		Room.subscribe(req, roomId, ['message', 'update']);
		res.ok(room);
	});
};
