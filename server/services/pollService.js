var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));

var Poll = require('../models/Poll');
var PollOption = require('../models/PollOption');

module.exports.start = function (roomMember, command) {
	return getCurrentPoll(roomMember).then(function (currentPoll) {
		var match = /^\/poll?(?:\s+(.+)?|$)/ig.exec(command);
		var question = match[1];

		if (!currentPoll) {
			return createPoll(roomMember, question);
		}
		else {
			return Promise.resolve({message: buildResponse(currentPoll).message + "(Poll in Progress)" });
		}
	});
};

module.exports.close = function (roomMember, command) {

};

module.exports.vote = function (roomMember, command) {

};

function getCurrentPoll(roomMember) {
	// if there is already a current poll that's active for the room, return that one
	return Poll.findOne({room: roomMember.room, isOpen: true });
}

function createPoll(roomMember, question) {

}

function getPollOptions(roomMember, poll) {

}

function votePollOption(roomMember, poll, optionNumber) {

}

function buildResponse (poll, roomMember) {

}