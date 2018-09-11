app.component('messageReactions', {
	bindings: {
		reactions: '<'
	},
	templateUrl: '/assets/app/reaction/messageReactions.html',
	controllerAs: 'messageReactions',
	controller: function (emoticons) {
		this.emoticonReactions = _.reduce(this.reactions, (reactions, reaction) => {
			const existing = _.find(reactions, {emoticonName: reaction.emoticonName});
			if (existing) {
				existing.count++;
			}
			else {
				reactions.push({
					emoticonName: reaction.emoticonName,
					emoticonFile: _.find(emoticons.all, {name: reaction.emoticonName}).file,
					count: 1
				});
			}
			return reactions;
		}, []);
	}
});
