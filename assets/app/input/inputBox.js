app.directive('inputBox', function ($rootScope, $stateParams, bunkerData, emoticons, keycode) {
	return {
		template: `
		<div>
			<div class="container-fluid message-input" ng-show="$root.roomId">
				<div class="row">
					<form class="col-md-10 no-gutter">
						<textarea rows="1" class="form-control"></textarea>
						<button type="submit" class="btn btn-success visible-xs">Send</button>
						<upload-button></upload-button>
					</form>
				</div>
			</div>
			<div emoticon-menu class="message-popup container"></div>
		</div>
		`,
		link: function (scope, elem) {
			var searchingFor, searchTerm, matches, suggestedTerm, matchingEmoticons, matchingUsers, matchIndex, hidden;

			var editingMessage;

			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);
			var send = container.find('button[type="submit"]');
			var popup = $('.message-popup', elem);
			resetMatchSearch();
			resetMessageEditing();

			// anchors are the special keys which define an emoticon or user
			var anchors = {
				'emoticons': ':',
				'users': '@'
			};

			// handlers are triggered when a specific key is pressed
			var handlers = {
				'enter': enter,
				'backspace': backspace,
				'esc': reset,
				'tab': tab,
				'space': space,
				'up': up,
				'down': down,
				';': emoticon,
				'2': user
			};

			// search functions which are triggered when an anchor is used
			var searchers = {
				'emoticons': searchForEmoticons,
				'users': searchForUsers,
				null: _.noop
			};

			// the functions to render the html in the popup
			var render = {
				'emoticons': renderEmoticons,
				'users': renderUsers
			};

			// events

			// every key press in the text area
			inputBox.keydown(e => {
				bunkerData.broadcastTyping($rootScope.roomId);

				// gets a human readable keyboard value
				var key = keycode(e);

				var handler = handlers[key];
				if (handler) {
					handler(e);
				}

				if (searchingFor) {
					searchers[searchingFor](key);
					var html = render[searchingFor]();
					popup.html(html);

					if (hidden) {
						popup.show();
						popup.on("click", "li", popupClick);
					}
				}
			});

			// Change the text if commanded to do so
			scope.$on('inputText', function (evt, text) {
				var val = inputBox.val();
				var append = val.length ? ' ' : ''; // start with a space if message already started
				append += text + ' ';
				val += append;
				inputBox.val(val);
				inputBox.focus();
			});

			$rootScope.$on('roomIdChanged', () => {
				resetMatchSearch();
				resetMessageEditing();
				inputBox.focus();
			});
			$rootScope.$on('bunkerDataLoaded', () => inputBox.focus());

			// the send button needs to be attached to the enter handler
			send.on("click", enter);

			function popupClick(e) {
				e.stopPropagation();
				e.preventDefault();

				if (!searchingFor) return;

				var item = $(e.currentTarget);
				var value = item.data('value');
				replaceMatch(searchTerm, value);
				selectItem();
				inputBox.focus();
			}

			function reset() {
				if (searchingFor)return resetMatchSearch();
				resetMessageEditing();
			}

			function resetMatchSearch() {
				searchingFor = null;
				searchTerm = "";
				matches = null;
				suggestedTerm = null;
				matchingEmoticons = null;
				matchingUsers = null;
				matchIndex = -1;
				hidden = true;
				popup.unbind("click");
				popup.html('');
				popup.hide();
			}

			function resetMessageEditing() {
				editingMessage = null;
				container.removeClass('edit-mode');
			}

			function selectItem() {
				if (searchingFor == 'emoticons') {
					inputBox.val(inputBox.val() + ':');
				}

				inputBox.val(inputBox.val() + ' ');

				resetMatchSearch();
			}

			function enter(e) {
				e.preventDefault();

				if (editingMessage) {
					editMessage()
				}
				else if (suggestedTerm) {
					selectItem();
				}
				else if (e.shiftKey && bunkerData.userSettings.multilineShiftEnter) {
					inputBox.val(inputBox.val() + '\n');
				}
				else {
					submitMessage();
				}

				reset();
			}

			function editMessage() {
				var text = inputBox.val();
				if (!/\S/.test(text)) return;

				editingMessage.text = text;
				editingMessage.edited = true;
				inputBox.val('');
				bunkerData.editMessage(editingMessage);
			}

			function submitMessage() {
				var text = inputBox.val();
				if (!/\S/.test(text)) return;

				inputBox.val('');
				bunkerData.createMessage($stateParams.roomId, text);
			}

			function backspace(e) {
				if (!searchTerm.length) {
					return resetMatchSearch();
				}

				if (suggestedTerm) {
					replaceMatch(suggestedTerm, searchTerm);
					suggestedTerm = null;
					matchIndex = -1;
					e.preventDefault();
					return;
				}

				searchTerm = searchTerm.slice(0, -1);
			}

			function tab(e) {
				e.preventDefault();
				if (!searchingFor) return;

				var oldSuggestion = suggestedTerm || searchTerm;
				suggestedTerm = getNextMatch(e.shiftKey);

				replaceMatch(oldSuggestion, suggestedTerm);
			}

			function space(e) {
				if (searchingFor && suggestedTerm) {
					e.preventDefault();
					selectItem();
				}
			}

			function up(e) {
				e.preventDefault();
				var messages = getMessages();

				if (!editingMessage) {
					editingMessage = _.last(messages);
				}
				else {
					var currentIndex = _.findIndex(messages, {_id: editingMessage._id});
					console.log(currentIndex);
					if (currentIndex == 0) return;
					editingMessage = messages[currentIndex - 1];
				}

				container.addClass('edit-mode');
				inputBox.val(editingMessage.text);
			}

			function down(e) {
				if (!editingMessage) return resetMessageEditing();

				var messages = getMessages();
				var currentIndex = _.findIndex(messages, {_id: editingMessage._id});
				editingMessage = messages[currentIndex + 1];

				// no more messages
				if (!editingMessage) {
					inputBox.val('');
					return resetMessageEditing();
				}

				inputBox.val(editingMessage.text);
			}

			function getMessages() {
				var currentRoom = bunkerData.getRoom($rootScope.roomId);
				return currentRoom.$messages.filter(message => {
					return message.author && message.author._id == bunkerData.user._id;
				});
			}

			function replaceMatch(oldText, newText) {
				var anchor = anchors[searchingFor];
				var oldSuggestion = `${anchor}${oldText}${anchor}`;

				var suggestionSearch = anchor + newText;

				var currentText = inputBox.val();
				var currentSearch = new RegExp(`${oldSuggestion}*$`);
				currentText = currentText.replace(currentSearch, suggestionSearch);

				inputBox.val(currentText);
			}

			function getNextMatch(shiftKey) {
				matchIndex += shiftKey ? -1 : 1;

				if (matchIndex >= matches.length) {
					matchIndex = 0;
				}

				if (matchIndex < 0) {
					matchIndex = matches.length - 1;
				}

				return matches[matchIndex];
			}

			function emoticon(e) {
				if (!e.shiftKey) return;
				if (searchingFor == 'emoticons') return resetMatchSearch();
				searchingFor = 'emoticons';
			}

			function searchForEmoticons(key) {
				// only allow single letters/numbers/underscores on search term
				var singleLetterNumber = /^[\w\d\_]{1}$/g;
				if (singleLetterNumber.test(key)) {
					searchTerm += key;
				}

				matchingEmoticons = _.filter(emoticons.imageEmoticons, emoticon => emoticon.name.indexOf(searchTerm) == 0);
				matches = _.map(matchingEmoticons, 'name');
			}

			function renderEmoticons() {
				return `
					<ol class="row list-unstyled ng-scope">
						${_.map(matchingEmoticons, emoticon => `
							<li class="col-xs-3 emoticonListItem ${emoticon.name == suggestedTerm ? 'emoticon-selected' : ''}"
								data-value="${emoticon.name}">
								<a>
									<div class="emoticon-container">
										<img class="emoticon" src="/assets/images/emoticons/${emoticon.file}">
									</div>
									:${emoticon.name}:
								</a>
							</li>
						`).join('')}
					</ol>
				`
			}

			function user(e) {
				if (!e.shiftKey) return;
				if (searchingFor == 'users') return resetMatchSearch();
				searchingFor = 'users';
			}

			function searchForUsers(key) {
				// only allow single letters/numbers/underscores on search term
				var singleLetterNumber = /^[\w\s\-\.]{1}$/g;
				if (singleLetterNumber.test(key)) {
					searchTerm += key;
				}

				// since the @ key is actually shift + 2, when the search term is this, ignore it
				// since it is the start of looking for a specific user: eg @Jason == 2Jason
				if (searchTerm == '2') {
					searchTerm = '';
				}

				var currentRoom = bunkerData.getRoom($rootScope.roomId);
				var users = _.map(currentRoom.$members, 'user');
				var activeUsers = _.filter(users, user => moment().diff(user.lastConnected, 'days') < 45);

				matchingUsers = _.filter(activeUsers, user => user.nick.toLowerCase().indexOf(searchTerm) == 0);
				matches = _.map(matchingUsers, 'nick');
			}

			function renderUsers() {
				return `
					<ol class="row list-unstyled ng-scope">
						${_.map(matchingUsers, user => `
							<li class="col-xs-3 ${user.nick == suggestedTerm ? 'emoticon-selected' : ''}">
								<a>
									<img src="${user.$gravatar}" title="${user.email}"/>
									${user.nick}
								</a>
							</li>
						`).join('')}
					</ol>
				`
			}
		}
	}
});
