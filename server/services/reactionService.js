const reactionService = module.exports;
const Message = require('../models/Message');

reactionService.toggleReaction = function (messageId, userId, emoticonName) {
	return Message.findById(messageId)
		.populate('author reactions')
		.then(message => {

			console.log(message);

			message.reactions = message.reactions || [];

			const existing = _.find(message.reactions, reaction => {
				return reaction.author === userId && reaction.emoticonName === emoticonName;
			});

			if (existing) {
				_.remove(message.reactions, existing);
			}
			else {
				message.reactions.push({
					author: userId,
					emoticonName
				});
			}
			return message.save();
		});
};
