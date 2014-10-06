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

		this.submittedMessages.unshift(this.messageText);
		this.selectedMessageIndex = -1;
		this.messageText = '';
	};
	this.keyDown = function(evt) {
		if (evt.keyCode == 9) { // tab
			evt.preventDefault();

			var matchingEmoticons = _.filter(emoticons.names, function (emoticon) {
				return emoticon.indexOf(emoticonSearch) == 0
			});

			if(evt.shiftKey) {
				emoticonSearchIndex = emoticonSearchIndex > 0 // TODO this is broken
					? Math.max(emoticonSearchIndex - 1, 0)
					: matchingEmoticons.length - 1;
			}
			else {
				emoticonSearchIndex = emoticonSearchIndex < matchingEmoticons.length - 1
					? Math.min(emoticonSearchIndex + 1, matchingEmoticons.length - 1)
					: 0;
			}
			this.messageText = ':' + matchingEmoticons[emoticonSearchIndex] + ':';
			//console.log(emoticonSearch, emoticonSearchIndex, matchingEmoticons);
		}
	};
	this.keyUp = function (evt) {
		if (evt.keyCode == 38 || evt.keyCode == 40) { // up or down
			this.selectedMessageIndex += evt.keyCode == 38 ? 1 : -1;

			if (this.selectedMessageIndex < 0) {
				this.selectedMessageIndex = 0;
			}
			else if (this.selectedMessageIndex >= this.submittedMessages.length) {
				this.selectedMessageIndex = this.submittedMessages.length - 1;
			}

			this.messageText = this.submittedMessages[this.selectedMessageIndex];
		}
		else if (/^:\w+$/.test(this.messageText) && evt.keyCode != 9 && evt.keyCode != 16) {
			//console.log('txt is', this.messageText, evt.keyCode);
			emoticonSearch = this.messageText.substring(1, this.messageText.length);
			emoticonSearchIndex = -1;
			//console.log(emoticonSearch)
		}
		//console.log(evt.keyCode, evt);
	};
});