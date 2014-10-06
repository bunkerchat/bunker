app.controller('InputController', function ($stateParams, bunkerApi, emoticons) {
	var emoticonSearch = '';
	var emoticonSearchIndex = -1;
	this.messageText = '';
	this.submittedMessages = [];
	this.selectedMessageIndex = -1;

	this.sendMessage = function () {
		if (!this.messageText) return;

		var newMessage = new bunkerApi.message();
		newMessage.room = $stateParams.roomId;
		newMessage.text = this.messageText;
		newMessage.$save();

		// Save message for up/down keys to retrieve
		this.submittedMessages.unshift(this.messageText);

		// Reset all the things
		this.selectedMessageIndex = -1;
		this.messageText = '';
		emoticonSearch = '';
		emoticonSearchIndex = -1;
	};
	this.keyDown = function (evt) {
		if (evt.keyCode == 9) { // tab
			evt.preventDefault(); // prevent tabbing out of the text input

			if (emoticonSearch) { // if we're in a search

				var matchingEmoticons = _.filter(emoticons.names, function (emoticon) {
					return emoticon.indexOf(emoticonSearch) == 0
				});

				if (matchingEmoticons.length == 0) return; // no matches, nothing to do

				if (evt.shiftKey) { // shift modifier goes backwards through the matches
					emoticonSearchIndex = emoticonSearchIndex > 0
						? Math.max(emoticonSearchIndex - 1, 0)
						: matchingEmoticons.length - 1;
				}
				else { // cycle
					emoticonSearchIndex = emoticonSearchIndex < matchingEmoticons.length - 1
						? Math.min(emoticonSearchIndex + 1, matchingEmoticons.length - 1)
						: 0;
				}

				// Replace the last emoticon text with a match
				this.messageText = this.messageText.replace(/:\w+:?$/, ':' + matchingEmoticons[emoticonSearchIndex] + ':');
			}
		}
	};
	this.keyUp = function (evt) {
		if (evt.keyCode == 38 || evt.keyCode == 40) { // up or down, cycle through last messages
			this.selectedMessageIndex += evt.keyCode == 38 ? 1 : -1;

			if (this.selectedMessageIndex < 0) {
				this.selectedMessageIndex = 0;
			}
			else if (this.selectedMessageIndex >= this.submittedMessages.length) {
				this.selectedMessageIndex = this.submittedMessages.length - 1;
			}

			this.messageText = this.submittedMessages[this.selectedMessageIndex];
		}
		else if (/:\w+$/.test(this.messageText) && evt.keyCode != 9 && evt.keyCode != 16) {
			// if an emoticon is at the end of the message, start the search
			emoticonSearch = this.messageText.match(/:(\w+)$/)[1];
			emoticonSearchIndex = -1;
		}
	};
});