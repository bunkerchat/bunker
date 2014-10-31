app.directive('messageMention', function() {
	return {
		scope: {
			userNick: '@messageMention',
			messageText: '@messageMentionText'
		},
		link: function(scope, elem) {
			if(new RegExp(scope.userNick + '(?:[^@\\w]|$)', 'i').test(scope.messageText)) {
				elem.addClass('message-mention');
			}
		}
	}
});
