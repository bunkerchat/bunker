/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(request, response) {

		var author = request.session.user;
		var roomId = request.body.roomId;
		// TODO if author is not a member of the roomId, cancel
		var text = request.body.text;
		// TODO format text, parse out bad things, do commands?

        Message.create({
			roomId: roomId,
            author: author.id,
            text: text
        }).exec(function(error, message) {
            Message.findOne(message.id).populateAll().exec(function(error, message) {
				// TODO only publish create to the appropriate clients
                Message.publishCreate(message, request);
                response.json(message);
            });
        });
    }
};

