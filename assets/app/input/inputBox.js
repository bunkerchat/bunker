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
			<div class="message-popup"></div>
		</div>
		`,
		link: function (scope, elem) {
			var searching;
			var searchTerm = "";
			var html;
			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);
			var popup = $('.message-popup', elem);

			// container.qtip({
			// 	content: {
			// 		text: 'Open at the mouse position!'
			// 	},
			// 	position: {
			// 		my: 'bottom left',
			// 		at: 'top left'
			// 	},
			// 	show: {
			// 		event: false
			// 	}
			// });

			// var tooltip = container.qtip('api');

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
					// tooltip.set('content.text', html);
					// tooltip.toggle(true);
					popup.html(html);
					popup.show();
				}
				else {
					popup.hide();
					// tooltip.toggle(false);
				}
			});

			var handlers = {
				'enter': enterHandler,
				'backspace': backspaceHandler,
				'esc': escHandler,
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

				// console.log(searchTerm, matchingEmoticons)

				html = renderEmoticons(matchingEmoticons);
			}

			function renderEmoticons(emoticons) {
				return `
					<div class="">
						${_.map(emoticons, emoticon => `
							<!--<li class="col-xs-3 emoticonListItem">-->
							<span class="popup-item">
								<a>
									<div class="emoticon-container">
										<img class="emoticon" src="/assets/images/emoticons/${emoticon.file}">
									</div>
									:${emoticon.name}:
								</a>
								</span>
							<!--</li>-->
						`).join('')}
					</div>
				`
			}
		}
	}
});
