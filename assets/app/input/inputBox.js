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
			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);
			var send = container.find('button[type="submit"]');
			var popup = $('.message-popup', elem);
			reset();

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
				}

				if (searchTerm) {
					var html = render[searchingFor]();
					popup.html(html);

					if(hidden) {
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

			// the send button needs to be attached to the enter handler
			send.on("click", enter);

			function popupClick(evt) {
				var item = $(evt.currentTarget);
				var value = item.data('value');
				replaceMatch(searchTerm, value);
				selectItem();
				inputBox.focus();
			}

			function reset() {
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

			function selectItem(){
				if (searchingFor == 'emoticons') {
					inputBox.val(inputBox.val() + ':');
				}

				inputBox.val(inputBox.val() + ' ');

				reset();
			}

			function enter(e) {
				e.preventDefault();

				if (searchingFor && suggestedTerm) {
					selectItem();
					return;
				}

				reset();

				var text = inputBox.val();
				if(!/\S/.test(text)) return;

				return bunkerData.createMessage($stateParams.roomId, text)
					.then(() => inputBox.val(''));
			}

			function backspace(e) {
				if (!searchTerm.length) {
					return reset();
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
				if (searchingFor == 'emoticons') return reset();
				searchingFor = 'emoticons';
			}

			function searchForEmoticons(key) {
				// only allow single letters/numbers/underscores on search term
				var singleLetterNumber = /^[\w\d\_]{1}$/g;
				if (singleLetterNumber.test(key)) {
					searchTerm += key;
				}

				matchingEmoticons = _.filter(emoticons.all, emoticon => emoticon.name.indexOf(searchTerm) == 0);
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
				if (searchingFor == 'users') return reset();
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
