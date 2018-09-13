app.component('messageReactions', {
	bindings: {
		reactions: '<'
	},
	templateUrl: '/assets/app/reaction/messageReactions.html',
	controllerAs: 'messageReactions',
	controller: function (emoticons, bunkerData) {
		this.reactionsByAuthor = _(this.reactions)
			.groupBy('author')
			.map((reactions, authorId) => ({
				author: bunkerData.getUser(authorId),
				reactions: _.map(reactions, reaction => ({
					emoticonName: reaction.emoticonName,
					emoticonFile: _.find(emoticons.all, {name: reaction.emoticonName}).file,
				}))
			}))
			.value();
	}
});
