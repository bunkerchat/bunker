var Promise = require('bluebird');
var request = Promise.promisifyAll(require('request'));
var socketio = require('../config/socketio');

var Poll = require('../models/Poll');
var PollOption = require('../models/PollOption');

module.exports.start = function (roomMember, command) {
	var match = /^\/poll?(?:\s+(.+)?|$)/ig.exec(command);
	var question = match[1];
	var defaultPollOptions = ["True", "False", "I don't care"];
	var optionVotes = [];

	return Poll.findOne({room: roomMember.room, isOpen: true})
		.then(function (poll) {
			if(poll) {
				return buildPollResponse(poll);
			}

			_.each(defaultPollOptions, function(option, index){
				optionVotes.push(0);
			});
			return Poll.create({
				user: roomMember.user._id,
				room: roomMember.room,
				question: question,
				options: defaultPollOptions,
				optionVotes: optionVotes,
			}).then(function (newPoll) {
				return defaultPollResponse(newPoll);
			});
		});


};

module.exports.vote = function(roomMember, command) {
	var match = /^\/vote?(?:\s+(.+)?|$)/ig.exec(command);
	var optionNumber = match[1];

	return Poll.findOne({room: roomMember.room, isOpen: true})
		.then(function (activePoll) {
			var num = parseInt(activePoll.optionVotes[optionNumber]);
			num = num + 1;
			activePoll.optionVotes[optionNumber] = num;

			return Promise.join(
				Poll.update({_id: activePoll._id}, {optionVotes: activePoll.optionVotes}, {upsert: true}),
				defaultPollResponse(activePoll)
			)
				.spread(function(poll, response) {
					return response;
				});


		});

};

function defaultPollResponse(newPoll) {
	var user = newPoll.user;
	var question = newPoll.question;
	var responseString = [];

	responseString.push(user + " is asking: " + question);

	_.each(newPoll.options, function(option, index) {
		var numVotes = newPoll.optionVotes[index];
		responseString.push(index + ". " + option + "  : " + numVotes + " votes");
	});

	return {message: responseString};
}



































/*
	var defaultPollOptions = ["True", "False", "I don't care"];
	return getCurrentPoll(roomMember, question).then(function (currentPoll) {
		if(!currentPoll) {
			if(!question) throw new InvalidInputError('No question for new poll');
			else throw new InvalidInputError('There is currently an active poll');
		}

/!*		return PollOption.find({poll: currentPoll._id}).then(function (options) {
			if(!options || options.length == 0) {

				//var optionPromises = [];

/!*				_.each(defaultPollOptions, function(defaultOption, index){
					optionPromises.push(Promise PollOption.create({
						poll: currentPoll._id,
						optionString: defaultOption,
						optionNumber: index + 1
					});


				})*!/

				return Promise.each(defaultPollOptions, function(defaultOption, index) {
					return PollOption.create({
						poll: currentPoll._id,
						optionString: defaultOption,
						optionNumber: index + 1
					});
				});
			}
		});*!/

		return buildNewResponse(currentPoll);


/!*		if(currentPoll && !question) {
			return buildResponse(currentPoll);
		}*!/
/!*		if (!currentPoll) {
			return createPoll(roomMember, question);
		}*!/
/!*		else {
			return getPollOptions(currentPoll).then(function(allOptions) {
				return buildResponse(currentPoll, allOptions);
			});
		}*!/
	});
};

module.exports.close = function (roomMember, command) {

};

module.exports.vote = function (roomMember, command) {
	var match = /^\/vote?(?:\s+(.+)?|$)/ig.exec(command);
	// console.log( "this is match :   " + match[1]);
	var optionNumber = match[1];

	return Poll.findOne({room: roomMember.room, isOpen: true})
		.then(function (poll) {
			PollOption.find({poll: poll._id})
				.then(function (options) {
					if(options){
						console.log(options);
						console.log("Options exists yo " + options[1].optionString + " !!!!");
					} else if (!options) {
						console.log("Options don't exist");
					}
				});
		});
/!*
	var currentPoll = getCurrentPoll(roomMember)

	if (currentPoll) {
		votePollOption(roomMember, currentPoll);
	}*!/
/!*	optionVotesUpdated = currentPoll.optionVotes;

	//optionVotesUpdated[optionNumber] = + 1;

	return Poll.findByIdAndUpdate(currentPoll._id, {optionVotes: optionVotesUpdated})
		.then( function (updatedPoll) {

			socketio.io.to('poll_' + updatedPoll._id)
				.emit('poll', {
					_id: updatedPoll._id,
					verb: 'updated',
					data: {optionVotes: optionVotesUpdated }
				});

			return buildResponse(updatedPoll, roomMember);
		});*!/

};

function aa(currentPoll, allOptions) {
	var askingUser = currentPoll.user.nick;
	var question = currentPoll.question;
	var responseString = [];
	responseString.push(askingUser + " is asking: " + question);

	_.each(allOptions, function(option) {
		responseString.push(option.optionNumber + ". " + option.optionString + " : " + option.numberOfVotes + " votes");
	});
	return {message: responseString};
}

function buildNewResponse(currentPoll) {
	PollOption.find({poll: currentPoll._id})
		.then(function (allOptions) {
			//var askingUser = currentPoll.user.nick;
			var question = currentPoll.question;
			var responseString = [];
			responseString.push("I " + " is asking: " + question);

			_.each(allOptions, function(option) {
				responseString.push(option.optionNumber + ". " + option.optionString + " : " + option.numberOfVotes + " votes");
			});

			messageString = responseString.join(" | ");
			return {message: messageString};
		});
}

/!*function createPoll(roomMember, question) {
	if (!question) throw new InvalidInputError('Invalid question for poll');
	var optionsArray = [];
	var optionsVotesArray = [];
	optionsArray.push("True");
	optionsVotesArray.push('0');
	optionsArray.push("False");
	optionsVotesArray.push('0');


	return Poll.create({
		user: roomMember.user,
		room: roomMember.room,
		question: question,
	})
		.then(function (newPoll) {
			var numResponses = 2;
			var optionStrings =["True", "False"];
			var number = 1;

/!*			return Promise.join(
				PollOption.create({poll: newPoll._id, optionString: "True", optionNumber: 1}),
				PollOption.create({poll: newPoll._id, optionString: "False", optionNumber: 2})
			)*!/

			return Promise.each(optionStrings, function(option) {
				return PollOption.create({poll: newPoll._id, optionString: option, optionNumber: number})
					.then(function (option) {
						number += 1;
						return option;
					});
			})
				.then(function (allOptions) {
					return buildResponse(newPoll, allOptions);
				});

		});
}*!/



function getCurrentPoll(roomMember, question) {
	// if there is already a current poll that's active for the room, return that one
	return Poll.findOne({room: roomMember.room, isOpen: true })
		.then(function(currentPoll) {
			if(currentPoll && question) {
				return null;
			}
			else if (!question && !currentPoll) {
				return null;
			}
			else if (currentPoll && !question) {
				return currentPoll;
			}
			else if(question && !currentPoll) {
				return createPoll(roomMember, question);
				//return Poll.create({user: roomMember.user, room: roomMember.room, question: question});
			}
		});
}





function createPoll(roomMember, question) {
	return Poll.create({user: roomMember.user, room: roomMember.room, question: question})
		.then(function (newPoll) {
			var defaultPollOptions = ["True", "False", "I don't care"];
			return Promise.each(defaultPollOptions, function (defaultOption, index) {
				return PollOption.create({
					poll: newPoll._id,
					optionString: defaultOption,
					optionNumber: index + 1
				});
			})
				.spread(function (opt1, op2, opt3) {
					return newPoll;
				});

		});
}


function getPollOptions(poll) {
	// gets all poll options for a poll
	return PollOption.find({poll: poll._id});
}

function votePollOption(roomMember, poll, optionNumber) {
	var newNumVotes;

	return PollOption.findOne({poll: poll._id, optionNumber: optionNumber})
		.then(function (selectedPollOption) {
			if(!selectedPollOption) throw new InvalidInputError('Invalid option for poll');

			newNumVotes = selectedPollOption.numberOfVotes;
			newNumVotes += 1;

			return PollOption.findByIdAndUpdate(selectedPollOption._id, {numberOfVotes: newNumVotes});
		})
		.then(function (updatedPollOption) {

			socketio.io.to('polloption' + updatedPollOption._id)
				.emit('polloption', {
					_id: updatedPollOption._id,
					verb: 'updated',
					data: {numberOfVotes: newNumVotes}
				});

			return PollOption.find({poll: poll._id})
				.then(function (allOptions) {
					return buildResponse(poll, allOptions);
				});
		});
}

function doesOptionExist(poll, optionNumber) {
	return PollOption.findOne({poll: poll._id, optionNumber: optionNumber});
}

function buildInitialPollResponse(currentPoll, pollOption1, pollOption2, pollOption3) {
	var askingUser = currentPoll.user.nick;
	var question = currentPoll.question;
	var responseString = [];
	responseString.push(askingUser + " is asking: " + question);
	responseString.push(pollOption1.optionNumber + ". " + pollOption1.optionString + " : " + pollOption1.numberOfVotes + " votes");
	responseString.push(pollOption2.optionNumber + ". " + pollOption2.optionString + " : " + pollOption2.numberOfVotes + " votes");
	responseString.push(pollOption3.optionNumber + ". " + pollOption3.optionString + " : " + pollOption3.numberOfVotes + " votes");
	return {message: responseString};

}

function buildResponse (poll, pollOptions) {
	var askingUser = poll.user.nick;
	var question = poll.question;
	var responseString = [];
	responseString.push(askingUser + " is asking: " + question);
	var allOptions = pollOptions;
	allOptions.forEach(function (option) {
		var optionNumber = option.optionNumber;
		var optionString = option.optionString;
		var votes = option.numberOfVotes;
		responseString.push(optionNumber + ". " + optionString + " : " + votes + " votes");
	});
	return {message: responseString};
/!*
	pollOptions.forEach(function (option) {
		var optionNumber = option.optionNumber;
		var optionString = option.optionString;
		var votes = option.numberOfVotes;
		responseString.push(optionNumber + ". " + optionString + " : " + votes + " votes");
	});*!/

	//return {message: responseString};
}
*/
