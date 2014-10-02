/**
 * RoomController
 *
 * @description :: Server-side logic for managing rooms
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports.connectedMembers = function (req, res) {

};

module.exports.findOne = function (req, res) {
	var roomId = req.param('id');
	var user = req.session.user;
	// TODO check for roomId and user values

	Room.findOne(roomId).populateAll().exec(function (err, room) {
		var inRoom = _.any(room.members, {id:user.id});
		if(!inRoom){
			room.members.add(user.id);
			room.save();
		}

		Room.subscribe(req, roomId, ['message', 'update']);
		res.ok(room);
	});

	//Message.find().where({room: roomId}).sort('createdAt DESC').limit(50).populateAll().exec(function (error, message) {
	//	//sails.sockets.join(req.socket, 'room.' + roomId);
	//
	//});
};
