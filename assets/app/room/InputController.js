app.controller('InputController', function ($stateParams, bunkerApi, emoticons, rooms) {

	var messageEditWindowSeconds = 15;
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

	var previousText = undefined;
	this.editMode = false;

	this.sendMessage = function () {
		if (!this.messageText) return;

		var toSave = new bunkerApi.message();
		toSave.room = roomId;
		toSave.text = this.messageText;

		var historicMessage = { text: this.messageText, createdAt: new Date()};

		if (!this.editMode) {
			toSave.$save(function (result) {
				historicMessage.id = result.id;
			});

			// Save message for up/down keys to retrieve
			this.submittedMessages.unshift(historicMessage);
		} else {
			this.submittedMessages[this.selectedMessageIndex].text = this.messageText;
			toSave.id = this.submittedMessages[this.selectedMessageIndex].id;
			toSave.edited = true;
			toSave.history = toSave.history || '';
			toSave.history += ',' + previousText;
			toSave.$save(function (result) {
				// todo: react appropriately
			});
		}
		// Reset all the things
		this.selectedMessageIndex = -1;
		this.messageText = '';
		this.editMode = false;
		previousText = undefined;
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
				var matchingNames = _.filter(currentRoom && currentRoom.members, function(item) {
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

			this.messageText = chosenMessage.text;

			var acceptableEditDate = new Date();
			acceptableEditDate.setSeconds(acceptableEditDate.getSeconds() - messageEditWindowSeconds);
			if (chosenMessage.createdAt > acceptableEditDate) {
				this.editMode = true;
				previousText = chosenMessage.text;
			}
		}
		else if (evt.keyCode != 9 && evt.keyCode != 16) {
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
});