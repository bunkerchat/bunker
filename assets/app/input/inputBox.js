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
			var html, searching, searchTerm, matches, suggestion;
			var matchIndex = -1;
			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);
			var popup = $('.message-popup', elem);
			popup.hide();
			escHandler();

			inputBox.keydown(e => {
				var key = keycode(e);

				var handler = handlers[key];
				if (handler) {
					handler(e);
				}

				console.log(searching, key);

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

			var anchors = {
				'emoticons': ':',
				'user': '@'
			};

			var handlers = {
				'enter': enterHandler,
				'backspace': backspaceHandler,
				'esc': escHandler,
				'tab': tabHandler,
				';': emoticonHandler
			};

			function enterHandler(e) {
				e.preventDefault();

				return bunkerData.createMessage($stateParams.roomId, inputBox.val())
					.then(() => inputBox.val(''));
			}

			function backspaceHandler() {
				if (!searchTerm.length) {
					searching = null;
				}

				searchTerm = searchTerm.slice(0, -1);
			}

			function escHandler() {
				searching = null;
				searchTerm = "";
				html = null;
				matches = null;
				matchIndex = -1;
			}

			function tabHandler(e) {
				e.preventDefault();
				if(!searching) return;

				var anchor = anchors[searching];
				var oldSuggestion = suggestion || `${anchor}${searchTerm}${anchor}`;

				matchIndex++;

				if(matchIndex >= matches.length) {
					matchIndex = 0;
				}

				suggestion = anchor + matches[matchIndex];

				if(searching == 'emoticons'){
					suggestion += anchor;
				}

				var currentText = inputBox.val();
				var currentSearch = new RegExp(`${oldSuggestion}*$`);
				currentText = currentText.replace(currentSearch, suggestion);


				inputBox.val(currentText);
			}

			function emoticonHandler(e) {
				if (!e.shiftKey) return;

				if (searching == 'emoticons') {
					return escHandler();
				}

				searching = 'emoticons';
			}

			var searchers = {
				'emoticons': searchForEmoticons,
				null: _.noop
			};

			function searchForEmoticons(key) {
				// only allow single letters/numbers/underscores on search term
				var singleLetterNumber = /^[\w\d\_]{1}$/g;
				if (singleLetterNumber.test(key)) {
					searchTerm += key;
				}

				var matchingEmoticons = _.filter(emoticons.all, emoticon => emoticon.name.indexOf(searchTerm) == 0);
				html = renderEmoticons(matchingEmoticons);
				matches = _.map(matchingEmoticons, 'name');
			}

			function renderEmoticons(emoticons) {
				return `
					<ol class="row list-unstyled ng-scope">
						${_.map(emoticons, emoticon => `
							<li class="col-xs-3 emoticonListItem">
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
