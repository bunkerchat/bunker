/**
 * MessageController
 *
 * @description :: Server-side logic for managing messages
 * @help        :: See http://links.sailsjs.org/docs/controllers
 */

module.exports = {
	create: function(request, response) {
        Message.create({
            author: request.session.user.id,
            text: request.body.text
        }).exec(function(error, message) {
            Message.findOne(message.id).populateAll().exec(function(error, message) {
                Message.publishCreate(message, request);
                response.json(message);
            });
        });
    }
};

