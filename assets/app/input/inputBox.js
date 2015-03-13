app.directive('inputBox', function ($rootScope, bunkerApi, emoticons, rooms) {

	var messageEditWindowSeconds = 30;

	var searchStates = {
		NONE: 'none',
		EMOTE: 'emote',
		NICK: 'nick'
	};

	return {
		scope: true,
		templateUrl: '/assets/app/input/inputBox.html',
		link: function (scope, elem) {
			var searchState = searchStates.NONE;
			var emoticonSearch = '';
			var emoticonSearchIndex = -1;
			var nickSearch = '';
			var nickSearchIndex = -1;

			scope.messageText = '';
			scope.submittedMessages = [];
			scope.selectedMessageIndex = -1;

			var previousText = null;
			scope.editMode = false;

			// bind our keyup/down funcs to input box.
			$('textarea', elem)
				.keydown(keyDown)
				.keyup(keyUp);

			scope.sendMessage = function () {
				if (!scope.messageText) return;

				var newMessage = new bunkerApi.message({
					room: $rootScope.roomId,
					text: scope.messageText
				});

				var chosenMessage = scope.selectedMessageIndex > -1 ? scope.submittedMessages[scope.selectedMessageIndex] : {createdAt: null};
				var historicMessage = {text: scope.messageText, createdAt: Date.now(), history: ''};

				if (!scope.editMode
					|| previousText == scope.messageText
					|| chosenMessage.edited
					|| !datesWithinSeconds(chosenMessage.createdAt, Date.now(), messageEditWindowSeconds)) {
					newMessage.$save(function (result) {
						// TODO use the result of this? currently this object is just forgotten about
						historicMessage.id = result.id;
					});

					// Save message for up/down keys to retrieve
					scope.submittedMessages.unshift(historicMessage);
				} else {
					scope.submittedMessages[scope.selectedMessageIndex].text = scope.messageText;
					newMessage.id = scope.submittedMessages[scope.selectedMessageIndex].id;
					newMessage.edited = true;
					chosenMessage.edited = true;
					newMessage.$save();
				}
				// Reset all the things
				scope.selectedMessageIndex = -1;
				scope.messageText = '';
				scope.editMode = false;
				previousText = null;
				emoticonSearch = '';
				emoticonSearchIndex = -1;
			};

			function keyDown(evt) {
				if (evt.keyCode == 13) { // enter
					evt.preventDefault();
					scope.sendMessage();
					scope.$apply();
				}
				else if (evt.keyCode == 9) { // tab
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
						scope.messageText = scope.messageText.replace(/:\w+:?$/, ':' + matchingEmoticons[emoticonSearchIndex] + ':');
						scope.$digest();
					}
					else if (searchState === searchStates.NICK) {
						var currentRoom = rooms.get($rootScope.roomId);
						var members = _.pluck(currentRoom.$members, 'user');
						var matchingNames = _.filter(currentRoom && members, function (item) {
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

						scope.messageText = scope.messageText.replace(/@[\w ]*?$/, '@' + matchingNames[nickSearchIndex].nick + ' ');
						scope.$digest();
					}
				}
			}

			function keyUp(evt) {
				if (evt.keyCode == 38 || evt.keyCode == 40) {// choose previous message to edit
					scope.selectedMessageIndex += evt.keyCode == 38 ? 1 : -1;

					if (scope.selectedMessageIndex < 0) {
						scope.selectedMessageIndex = 0;
					}
					else if (scope.selectedMessageIndex >= scope.submittedMessages.length) {
						scope.selectedMessageIndex = scope.submittedMessages.length - 1;
					}

					var chosenMessage = scope.submittedMessages[scope.selectedMessageIndex];
					previousText = chosenMessage.text;

					scope.messageText = chosenMessage.text;

					if (datesWithinSeconds(chosenMessage.createdAt, Date.now(), messageEditWindowSeconds)) {
						scope.editMode = true;
					} else {
						scope.editMode = false;
					}

					scope.$digest();
				} else if (evt.keyCode == 27) { // 'escape'
					// Reset all the things
					scope.selectedMessageIndex = -1;
					scope.messageText = '';
					scope.editMode = false;
					previousText = null;
					emoticonSearch = '';
					emoticonSearchIndex = -1;
					scope.$digest();
				} else if (evt.keyCode != 9 && evt.keyCode != 16) {
					if (/:\w+$/.test(scope.messageText)) {
						searchState = searchStates.EMOTE;
						// if an emoticon is at the end of the message, start the search
						emoticonSearch = scope.messageText.match(/:(\w+)$/)[1];
						emoticonSearchIndex = -1;
					}
					else if (/@\w*$/.test(scope.messageText)) {
						searchState = searchStates.NICK;
						nickSearch = scope.messageText.match(/@(\w*)$/)[1];
						nickSearchIndex = -1;
					}
					else {
						searchState = searchStates.NONE;
					}
				}
			}

			function datesWithinSeconds(date1, date2, seconds) {
				if (!date1 || !date2) return false;
				var elapsed = Math.abs(date1 - date2) / 1000;
				return elapsed < seconds;
			}


		}
	};
});
