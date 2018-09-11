app.component('reactionMenu', {
	templateUrl: '/assets/app/reaction/reactionMenu.html',
	controller: function ($scope, emoticons, bunkerData) {
		this.imageEmoticons = emoticons.imageEmoticons;

		this.toggleReaction = emoticonName => {
			bunkerData.toggleReaction(bunkerData.reactionMenuMessageId, emoticonName);
			this.close();
		};

		this.close = () => {
			bunkerData.reactionMenuMessageId = null;
		};

		$scope.$watch(() => bunkerData.reactionMenuMessageId, () => {
			if(!bunkerData.reactionMenuMessageId) {
				this.messageTop = `-40000px`;
			}
			else {
				const top = $(`#${bunkerData.reactionMenuMessageId}`).position().top + 30;
				if (top + 200 > $(window).height()) {
					this.messageTop = `${top - 130}px`;
				}
				else {
					this.messageTop = `${top}px`;
				}
			}
		});

		// todo make menu close when clicking anywhere else
	}
});
