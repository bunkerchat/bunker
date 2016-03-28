app.directive('inputBox', function ($stateParams, bunkerData, emoticons, keycode) {
	return {
		template: `
		<div class="container-fluid message-input" 
			ng-show="$root.roomId">
			<div class="row">
				<form class="col-md-10 no-gutter">
					<textarea rows="1" class="form-control"></textarea>
				</form>
			</div>
		</div>
		`,
		link: function (scope, elem) {
			var searching;
			var searchTerm ="";
			var inputBox = $('textarea', elem);
			var container = $('.message-input', elem);

			container.qtip({
				content: {
					text: 'Open at the mouse position!'
				},
				position: {
					my: 'bottom left',
					at: 'top left'
				},
				show: {
					event: false
				}
			});

			var tooltip = container.qtip('api');

			inputBox.keydown(e => {
				var key = keycode(e);
				// console.log(key);

				var handler = handlers[key];
				if (handler) return handler(e);

				if (!searching) return;
				searchers[searching](key);
			});

			var handlers = {
				'enter': enterHandler,
				';': emoticonHandler
			};

			function emoticonHandler(e) {
				if (!e.shiftKey) return;

				if (searching == 'emoticons') {
					searching = null;
					tooltip.toggle(false);
					return;
				}

				searching = 'emoticons';
				tooltip.toggle(true);
			}

			function enterHandler(e) {
				e.preventDefault();

				bunkerData.createMessage($stateParams.roomId, inputBox.val())
					.then(() => inputBox.val(''));
			}

			function backspaceHandler() {
				if (!searchTerm.length) return;
				return searchTerm.slice(0, -1);
			}

			var searchers = {
				'emoticons': searchForEmoticons,
				null: _.noop
			}

			function searchForEmoticons(key) {
				if(key == 'backspace'){
					searchTerm = backspaceHandler()
				}
				else {
					searchTerm += key;
				}

				console.log(searchTerm);

				var matchingEmoticons = _.filter(emoticons.names, name => name.includes(searchTerm))
				console.log(matchingEmoticons);
			}
		}
	}
});
