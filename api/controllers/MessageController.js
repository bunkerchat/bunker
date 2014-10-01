/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports.create = function (req, res) {
	var author = req.session.user;
	var roomId = req.body.room;
	// TODO if author is not a member of the roomId, cancel
	var text = req.body.text;
	// TODO format text, parse out bad things, do commands?

	Message.create({
		room: roomId,
		author: author.id,
		text: text
	}).exec(function (error, message) {
		Message.findOne(message.id).populateAll().exec(function(error, message) {
			sails.sockets.broadcast('room.' + roomId, 'message', {verb: 'created', model: 'message', id: message.id, data: message}, req.socket);
			res.json(message);
		});
	});
};

module.exports.latest = function (req, res) {
	var roomId = req.param('roomId');
	var user = req.session.user;
	// TODO check for roomId and user values

	Message.find().where({room: roomId}).sort('createdAt DESC').limit(50).populateAll().exec(function (error, message) {
		sails.sockets.join(req.socket, 'room.' + roomId);
		res.json(message);
	});
};

