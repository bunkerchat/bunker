const pollService = module.exports
var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var socketio = require('../config/socketio');
var ent = require('ent');

const RoomService = require('./RoomService');
var Poll = require('../models/Poll');
var PollOption = require('../models/PollOption');

pollService.poll = (roomMember, text) => {
	const roomId = roomMember.room;
	return pollService.start(roomMember, text)
		.then(function (pollResponse) {
			if (pollResponse.isPrivate) {
				RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, pollResponse.message);
			} else {
				RoomService.messageRoom(roomId, pollResponse.message);
			}
		});
}

pollService.pollClose = (roomMember, text) => {
	const roomId = roomMember.room;
	return pollService.close(roomMember, text)
		.then(function (pollResponse) {
			if (pollResponse.isPrivate) {
				RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, pollResponse.message);
			} else {
				RoomService.messageRoom(roomId, pollResponse.message);
			}
		});
}

// voting is always private
pollService.vote = (roomMember, text) => {
	const roomId = roomMember.room;
	return pollService.vote(roomMember, text)
		.then(function (pollResponse) {
			RoomService.messageUserInRoom(roomMember.user._id, roomMember.room, pollResponse.message);
		});
}

pollService.start = function (roomMember, command) {
	var match = /^\/poll?(?:\s+(.+)?|$)/ig.exec(command);
	var question = match[1];
	var defaultPollOptions = ["True", "False", "I don't care"];
	var optionVotes = [];

	return Poll.findOne({room: roomMember.room, isOpen: true}).populate('user')
		.then(function (poll) {
			if(poll) {
				var isPrivate = true;
				return defaultPollResponse(poll, isPrivate);

			} else if(!poll && !question) {
				var isPrivate = true;
				var string = 'Needs questions to create poll';
				return buildMessage(isPrivate, string);
			}

			_.each(defaultPollOptions, function(option, index){
				optionVotes.push(0);
			});
			return Poll.create({
				user: roomMember.user,
				room: roomMember.room,
				question: question,
			}).then(function (newPoll) {

				return Promise.each(defaultPollOptions, function(option, index) {
					return PollOption.create({
						poll: newPoll._id,
						optionString: option,
						optionNumber: index + 1,
						numberOfVotes: 0,
					});
				})
					.spread(function(option1, option2, option3) {
						var isPrivate = false;
						return defaultPollResponse(newPoll, isPrivate);
					});
			});
		});
};

pollService.vote = function(roomMember, command) {
	var match = /^\/vote?(?:\s+(.+)?|$)/ig.exec(command);
	var optionNumber = match[1];

	return Poll.findOne({room: roomMember.room, isOpen: true}).populate('user')
		.then(function (activePoll) {

			if(!activePoll) {
				var isPrivate = true;
				var string = 'No active poll to vote for';
				return buildMessage(isPrivate, string);
			}

			var respondees = activePoll.respondees;
			if (respondees.indexOf(roomMember.user._id) != -1) {
				var isPrivate = true;
				var string = 'You have already voted';
				return buildMessage(isPrivate, string);

			} else {
				return PollOption.findOne({poll: activePoll._id, optionNumber: optionNumber})
					.then(function (selectedOption) {

						if(!selectedOption) {
							var isPrivate = true;
							var string = 'You have not selected a valid option';
							return buildMessage(isPrivate, string);
						}

						var num = parseInt(selectedOption.numberOfVotes);
						num = num + 1;
						selectedOption.numberOfVotes = num;

						respondees.push(roomMember.user._id);

						activePoll.resondees = respondees;

						var isPrivate = true;

						return Promise.join(
							selectedOption.save(),
							activePoll.save(),
							updatedVotePollResponse(activePoll, isPrivate)
						)
							.spread(function(pollOpts,activePoll, response) {
								return response;
							});
					});
			}
		});
};

pollService.close = function(roomMember, command) {
	var match = /^\/poll(\s?)close?(?:\s*)/ig.exec(command);
	var optionNumber = match[1];
	var userId = roomMember.user._id;

	return Poll.findOne({room: roomMember.room, isOpen: true}).populate('user')
		.then(function (activePoll) {
			// must create error handling for no active polls
			if (!activePoll) {
				var isPrivate = true;
				var string = 'No active poll';
				return buildMessage(isPrivate, string);
			}

			var ownerId = activePoll.user._id;
			if ( roomMember.role == 'administrator' || roomMember.role == 'moderator' || ownerId.equals(userId) ) {
				activePoll.isOpen = false;
				var isPrivate = false;
				return Promise.join(
					activePoll.save(),
					finalPollResults(activePoll, isPrivate)
				)
					.spread(function(poll, response) {
						return response;
					});

			} else {
				// you do not have perms to close poll
				var isPrivate = true;
				var string = 'Do not have permissions to close poll.';
				return buildMessage(isPrivate, string);
			}
		});
};

function finalPollResults(newPoll, isPrivate) {
	var user = newPoll.user.nick;
	var question = newPoll.question;
	var responseString = [];
	responseString.push(user + " is asking: " + question);

	return PollOption.find({poll: newPoll._id})
		.then(function (pollOptions) {
			var ascendingSort = _.sortBy(pollOptions, "numberOfVotes");
			var sortedList = ascendingSort.reverse();
			_.each(pollOptions, function(option, index) {
				var optionString = option.optionString;
				var optionNum = option.optionNumber;
				var numVotes = option.numberOfVotes;
				responseString.push(optionNum + ". " + optionString + "  : " + numVotes + " votes");
			});
			var winnerOption = sortedList[0];
			var winString = winnerOption.optionString;
			var winVotes = winnerOption.numberOfVotes;
			responseString.push("The top result is : " + winString + " with a total of " + winVotes);
			return {isPrivate: isPrivate, message: ent.encode(responseString.join('\n'))};
		});

}

function defaultPollResponse(newPoll, isPrivate) {
	var user = newPoll.user.nick;
	var question = newPoll.question;
	var responseString = [];
	responseString.push(user + " is asking: " + question);

	return PollOption.find({poll: newPoll._id})
		.then(function (pollOptions) {
			var ascendingSort = _.sortBy(pollOptions, "optionNumber");
			_.each(ascendingSort, function(option, index) {
				var optionString = option.optionString;
				var optionNum = option.optionNumber;
				var numVotes = option.numberOfVotes;
				responseString.push(optionNum + ". " + optionString + "  : " + numVotes + " votes");
			});
			return {message: ent.encode(responseString.join('\n')), isPrivate: isPrivate};
		});
}

function updatedVotePollResponse(newPoll) {
	var user = newPoll.user.nick;
	var question = newPoll.question;
	var responseString = [];
	responseString.push(user + " is asking: " + question);

	return PollOption.find({poll: newPoll._id})
		.then(function (pollOptions) {
			var ascendingSort = _.sortBy(pollOptions, "optionNumber");
			_.each(ascendingSort, function(option, index) {
				var optionString = option.optionString;
				var optionNum = option.optionNumber;
				var numVotes = option.numberOfVotes;
				responseString.push(optionNum + ". " + optionString + "  : " + numVotes + " votes");
			});
			return {isPrivate: true, message: ent.encode(responseString.join('\n'))};
		});
}

function buildMessage(isPrivate, string) {
	var responseString = [];
	responseString.push(string);

	return {isPrivate: isPrivate, message: ent.encode(responseString.join('\n'))};
}
