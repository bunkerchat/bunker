app.directive('inputBox', function ($stateParams, bunkerData, emoticons, keycode) {
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
			var html, searching, searchTerm, matches, suggestion, matchingEmoticons, matchIndex;
			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);
			var popup = $('.message-popup', elem);
			popup.hide();
			reset();

			var anchors = {
				'emoticons': ':',
				'user': '@'
			};

			var handlers = {
				'enter': enter,
				'backspace': backspace,
				'esc': reset,
				'tab': tab,
				';': emoticon
			};

			var searchers = {
				'emoticons': searchForEmoticons,
				null: _.noop
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
					popup.html(html);
					popup.show();
				}
				else {
					popup.hide();
				}
			});

			function enter(e) {
				e.preventDefault();
				reset();

				return bunkerData.createMessage($stateParams.roomId, inputBox.val())
					.then(() => inputBox.val(''));
			}

			function backspace() {
				if (!searchTerm.length) {
					searching = null;
				}

				if (suggestion){
					replaceText(suggestion, searchTerm);
					suggestion = null;
					return;
				}

				searchTerm = searchTerm.slice(0, -1);
			}

			function reset() {
				html = null;
				searching = null;
				searchTerm = "";
				matches = null;
				suggestion = null;
				matchingEmoticons = null;
				matchIndex = -1;
			}

			function tab(e) {
				e.preventDefault();
				if (!searching) return;

				var oldSuggestion = suggestion || searchTerm;
				suggestion = getNextMatch(e.shiftKey);

				replaceText(oldSuggestion, suggestion);
				renderEmoticons();
			}

			function replaceText(oldText, newText) {
				var anchor = anchors[searching];
				var oldSuggestion = `${anchor}${oldText}${anchor}`;

				var suggestionSearch = anchor + newText;

				if (searching == 'emoticons') {
					suggestionSearch += anchor;
				}

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

				return matches[matchIndex]
			}

			function emoticon(e) {
				if (!e.shiftKey) return;

				if (searching == 'emoticons') {
					return reset();
				}

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

				renderEmoticons();
			}

			function renderEmoticons() {
				html = `
					<ol class="row list-unstyled ng-scope">
						${_.map(matchingEmoticons, emoticon => `
							<li class="col-xs-3 emoticonListItem ${emoticon.name == suggestion ? 'emoticon-selected' : ''}">
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
		}
	}
});
