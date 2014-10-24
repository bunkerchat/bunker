app.controller('InputController', function ($stateParams, bunkerApi, emoticons, rooms) {

	var self = this;
	var messageEditWindowSeconds = 10;
	var roomId = $stateParams.roomId;
	var currentRoom = rooms(roomId);

	var searchStates = {
		NONE: 'none',
		EMOTE: 'emote',
		NICK: 'nick'
	};

	var searchState = searchStates.NONE;

	var emoticonSearch = '';
	var emoticonSearchIndex = -1;

	var nickSearch = '';
	var nickSearchIndex = -1;

	this.messageText = '';
	this.submittedMessages = [];
	this.selectedMessageIndex = -1;

	var previousText = null;
	this.editMode = false;

	this.sendMessage = function () {
		if (!this.messageText) return;

		var newMessage = new bunkerApi.message({
			room: roomId,
			text: this.messageText
		});

		var chosenMessage = this.selectedMessageIndex > -1 ?  this.submittedMessages[this.selectedMessageIndex] : {createdAt : null};
		var historicMessage = { text: this.messageText, createdAt: Date.now(), history : ''};

		if (!this.editMode ||
			previousText == this.messageText ||
			chosenMessage.edited ||
			!datesWithinSeconds(chosenMessage.createdAt, Date.now(), messageEditWindowSeconds)) {
			newMessage.$save(function (result) {
				historicMessage.id = result.id;
			});

			// Save message for up/down keys to retrieve
			this.submittedMessages.unshift(historicMessage);
		} else {
			self.submittedMessages[self.selectedMessageIndex].text = self.messageText;
			newMessage.id = this.submittedMessages[this.selectedMessageIndex].id;
			newMessage.edited = true;
			newMessage.history = chosenMessage.history || '';
			newMessage.history += (',' + previousText);
			chosenMessage.history = newMessage.history;
			chosenMessage.edited = true;
			newMessage.$save();
		}
		// Reset all the things
		this.selectedMessageIndex = -1;
		this.messageText = '';
		this.editMode = false;
		previousText = null;
		emoticonSearch = '';
		emoticonSearchIndex = -1;
	};

	this.keyDown = function (evt) {
		if (evt.keyCode == 9) { // tab
			evt.preventDefault(); // prevent tabbing out of the text input

			if (searchState === searchStates.EMOTE) { // if we're in a search

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
			else if (searchState === searchStates.NICK) {
				var matchingNames = _.filter(currentRoom && currentRoom.members, function (item) {
					return item.connected && item.nick.toLowerCase().slice(0, nickSearch.toLowerCase().length) === nickSearch.toLowerCase();
				});

				if (matchingNames.length == 0) return;

				if (evt.shiftKey) { // shift modifier goes backwards through the matches
					nickSearchIndex = nickSearchIndex > 0
						? Math.max(nickSearchIndex - 1, 0)
						: matchingNames.length - 1;
				}
				else { // cycle
					nickSearchIndex = nickSearchIndex < matchingNames.length - 1
						? Math.min(nickSearchIndex + 1, matchingNames.length - 1)
						: 0;
				}

				this.messageText = this.messageText.replace(/@[\w ]*?$/, '@' + matchingNames[nickSearchIndex].nick + ' ');
			}
		}
	};
	this.keyUp = function (evt) {
		if (evt.keyCode == 38 || evt.keyCode == 40) {// choose previous message to edit
			this.selectedMessageIndex += evt.keyCode == 38 ? 1 : -1;

			if (this.selectedMessageIndex < 0) {
				this.selectedMessageIndex = 0;
			}
			else if (this.selectedMessageIndex >= this.submittedMessages.length) {
				this.selectedMessageIndex = this.submittedMessages.length - 1;
			}

			var chosenMessage = this.submittedMessages[this.selectedMessageIndex];
			previousText = chosenMessage.text;

			this.messageText = chosenMessage.text;

			if (datesWithinSeconds(chosenMessage.createdAt, Date.now(), messageEditWindowSeconds)) {
				this.editMode = true;
			} else {
				this.editMode = false;
			}
		} else if (evt.keyCode == 27) { // 'escape'
			// Reset all the things
			this.selectedMessageIndex = -1;
			this.messageText = '';
			this.editMode = false;
			previousText = null;
			emoticonSearch = '';
			emoticonSearchIndex = -1;
		} else if (evt.keyCode != 9 && evt.keyCode != 16) {
			if (/:\w+$/.test(this.messageText)) {
				searchState = searchStates.EMOTE;
				// if an emoticon is at the end of the message, start the search
				emoticonSearch = this.messageText.match(/:(\w+)$/)[1];
				emoticonSearchIndex = -1;
			}
			else if (/@\w*$/.test(this.messageText)) {
				searchState = searchStates.NICK;
				nickSearch = this.messageText.match(/@(\w*)$/)[1];
				nickSearchIndex = -1;
			}
			else {
				searchState = searchStates.NONE;
			}
		}
	};

	function datesWithinSeconds(date1, date2, seconds){
		if (!date1 || ! date2) return false;
		var elapsed = Math.abs(date1 - date2) / 1000;
		return elapsed < seconds;
	}
});