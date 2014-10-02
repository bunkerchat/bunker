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
	var text = formatMessage(req.body.text);
	if(!text || !text.length) {
		res.badRequest();
		return;
	}

	Message.create({
		room: roomId,
		author: author.id,
		text: text
	}).exec(function (error, message) {
		Message.findOne(message.id).populateAll().exec(function(error, message) {
			Room.message(roomId, message);
			res.ok(message);
		});
	});
};

module.exports.latest = function (req, res) {
	var roomId = req.param('roomId');
	var user = req.session.user;
	// TODO check for roomId and user values

	Message.find().where({room: roomId}).sort('createdAt DESC').limit(50).populateAll().exec(function (error, message) {
		//sails.sockets.join(req.socket, 'room.' + roomId);
		res.ok(message);
	});
};

// TODO put this somewhere nicer
var knownEmoticons = [
	'allthethings.png',
	'doge.png',
	'eel.png',
	'hodor.png',
	'mindblown.gif',
	'okay.png',
	'stare.png',
	'tableflip.png',
	'trollface.png',
	'wat.png'];

function formatMessage(original) {
	if(!original || !original.length) return original;

	var formatted = original;
	// Parse emoticons
	var emoticonTexts = /:\w+:/.exec(original);
	_.each(emoticonTexts, function(emoticonText) {
		var knownEmoticon = _.find(knownEmoticons, function(known) { return known.replace(/.\w+$/, '') == emoticonText.replace(/:/g, '');});
		if(knownEmoticon) {
			formatted = formatted.replace(emoticonText, '<img class="emoticon" src="/images/emoticons/' + knownEmoticon + '"/>');
		}
	});

	return require('sanitize-html')(formatted, {
		allowedTags: ['img']
	});
}