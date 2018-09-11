app.component('reactionMenu', {
	templateUrl: '/assets/app/reaction/reactionMenu.html',
	controller: function ($scope, emoticons, bunkerData) {
		let currentMessageId = null;
		this.imageEmoticons = emoticons.imageEmoticons;

		this.toggleReaction = emoticonName => {
			bunkerData.toggleReaction(currentMessageId, emoticonName);
		};

		this.close = () => {
			this.reactionOpen = false;
		};

		$scope.$on('reactionMenuOpen', (event, messageId) => {
			currentMessageId = messageId;

			const top = $(`#${messageId}`).position().top + 30;
			this.reactionOpen = true;
			this.messageTop = `${top}px`;
		});

		$scope.$on('$destroy', () => {
			$(document).off('click.reactionMenu')
		});

		$(document).on('click.reactionMenu', this.close);
	}
});
