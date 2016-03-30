app.directive('inputBox', function ($rootScope, $stateParams, bunkerData, emoticons, keycode) {
	return {
		template: `
		<div>
			<div class="container-fluid message-input" ng-show="$root.roomId">
				<div class="row">
					<form class="col-md-10 no-gutter">
						<textarea rows="1" class="form-control"></textarea>
					</form>
				</div>
			</div>
			<div emoticon-menu class="message-popup container"></div>
		</div>
		`,
		link: function (scope, elem) {
			var searching, searchTerm, matches, suggestion, matchingEmoticons, matchingUsers, matchIndex, hidden;
			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);
			var popup = $('.message-popup', elem);
			reset();

			var anchors = {
				'emoticons': ':',
				'users': '@'
			};

			var handlers = {
				'enter': enter,
				'backspace': backspace,
				'esc': reset,
				'tab': tab,
				'space': space,
				';': emoticon,
				'2': user
			};

			var searchers = {
				'emoticons': searchForEmoticons,
				'users': searchForUsers,
				null: _.noop
			};

			var render = {
				'emoticons': renderEmoticons,
				'users': renderUsers
			};

			inputBox.keydown(e => {
				var key = keycode(e);

				var handler = handlers[key];
				if (handler) {
					handler(e);
				}

				if (searching) {
					searchers[searching](key);
				}

				if (searchTerm) {
					var html = render[searching]();
					popup.html(html);

					if(hidden) {
						popup.show();
						popup.on("click", "li", popupClick);
					}
				}
			});

			function popupClick(evt) {
				var item = $(evt.currentTarget);
				var value = item.data('value');
				replaceMatch(searchTerm, value);
				selectItem();
				inputBox.focus();
			}

			function reset() {
				searching = null;
				searchTerm = "";
				matches = null;
				suggestion = null;
				matchingEmoticons = null;
				matchingUsers = null;
				matchIndex = -1;
				hidden = true;
				popup.unbind("click");
				popup.html('');
				popup.hide();
			}

			function selectItem(){
				if (searching == 'emoticons') {
					inputBox.val(inputBox.val() + ':');
				}

				inputBox.val(inputBox.val() + ' ');

				reset();
			}

			function enter(e) {
				e.preventDefault();

				if (searching && suggestion) {
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

				if (suggestion) {
					replaceMatch(suggestion, searchTerm);
					suggestion = null;
					matchIndex = -1;
					e.preventDefault();
					return;
				}

				searchTerm = searchTerm.slice(0, -1);
			}

			function tab(e) {
				e.preventDefault();
				if (!searching) return;

				var oldSuggestion = suggestion || searchTerm;
				suggestion = getNextMatch(e.shiftKey);

				replaceMatch(oldSuggestion, suggestion);
			}

			function space(e) {
				if (searching && suggestion) {
					e.preventDefault();
					selectItem();
				}
			}

			function replaceMatch(oldText, newText) {
				var anchor = anchors[searching];
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
				if (searching == 'emoticons') return reset();
				searching = 'emoticons';
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
							<li class="col-xs-3 emoticonListItem ${emoticon.name == suggestion ? 'emoticon-selected' : ''}"
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
				if (searching == 'users') return reset();
				searching = 'users';
			}

			function searchForUsers(key) {
				// only allow single letters/numbers/underscores on search term
				var singleLetterNumber = /^[\w\s\-\.]{1}$/g;
				if (singleLetterNumber.test(key)) {
					searchTerm += key;
				}

				// ugh
				if (searchTerm == '2') {
					searchTerm = '';
				}

				var currentRoom = bunkerData.getRoom($rootScope.roomId);
				var users = _.map(currentRoom.$members, 'user');
				var activeUsers = _.filter(users, function (item) {
					return moment().diff(item.lastConnected, 'days') < 45;
				});

				matchingUsers = _.filter(activeUsers, user => user.nick.toLowerCase().indexOf(searchTerm) == 0);
				matches = _.map(matchingUsers, 'nick');
			}

			function renderUsers() {
				return `
					<ol class="row list-unstyled ng-scope">
						${_.map(matchingUsers, user => `
							<li class="col-xs-3 ${user.nick == suggestion ? 'emoticon-selected' : ''}">
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
