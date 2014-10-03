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

	Room.findOne(roomId).populateAll().exec(function (err, room) {
		var inRoom = _.any(room.members, {id: user.id});
		if (!inRoom) { // if user is not a current room member
			room.members.add(user.id); // make them one
			room.save(function(memberAddError, updatedRoom) {
				// repopulate and send update
				Room.findOne(updatedRoom.id).populateAll().exec(function(err, populatedRoom) {
					Room.publishUpdate(populatedRoom.id, populatedRoom);
				});
			});
		}

		// Subscribe the socket to message and updates of this room
		// Socket will now receive messages when a new message is created
		Room.subscribe(req, roomId, ['message', 'update']);
		res.ok(room);
	});
};
