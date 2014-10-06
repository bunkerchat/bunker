/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

// Create a new message, this will be the endpoint for POST /message
module.exports.create = function (req, res) {
	var author = req.session.user;
	var roomId = req.body.room;
	// TODO if author is not a member of the roomId, cancel
	var text = req.body.text;
	if (!text || !text.length) {
		res.badRequest();
		return;
	}

	// Create a message model object in the db
	Message.create({ // the model to add into db
		room: roomId,
		author: author.id,
		text: text
	}).exec(function (error, message) {
		// now that message has been created, get the populated version
		Message.findOne(message.id).populateAll().exec(function (error, message) {
			Room.message(roomId, message); // message all subscribers of the room that with the new message as data
			res.ok(message); // send back the message to the original caller
		});
	});
};

// Get the latest 50 messages, this will be the endpoint for
module.exports.latest = function (req, res) {
	var roomId = req.param('roomId');
	var user = req.session.user;
	// TODO check for roomId and user values

	// find finds multiple instances of a model, using the where criteria (in this case the roomId
	// we also want to sort in DESCing (latest) order and limit to 50
	// populateAll hydrates all of the associations
	Message.find().where({room: roomId}).sort('createdAt DESC').limit(50).populateAll().exec(function (error, messages) {
		res.ok(messages); // send the messages
	});
};