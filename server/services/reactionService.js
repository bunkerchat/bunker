const reactionService = module.exports;
const Message = require("../models/Message");

reactionService.toggleReaction = function(messageId, userId, emoticonName) {
	return Message.findById(messageId)
		.populate("reactions")
		.then(message => {
			message.reactions = message.reactions || [];

			const existing = _.filter(message.reactions, reaction => {
				return reaction.author.toString() === userId.toString() && reaction.emoticonName === emoticonName;
			});

			if (existing.length > 0) {
				message.reactions = _.difference(message.reactions, existing);
			} else {
				message.reactions.push({
					author: userId,
					emoticonName
				});
			}
			return message.save();
		});
};
