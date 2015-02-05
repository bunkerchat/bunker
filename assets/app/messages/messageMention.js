app.directive('messageMention', function () {
	return {
		link: function (scope, elem, attrs) {
			if (new RegExp(attrs.messageMention + '(?:[^@\\w]|$)', 'i').test(attrs.messageMentionText)) {
				elem.addClass('message-mention');
			}
		}
	}
});
