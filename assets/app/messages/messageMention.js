app.directive('messageMention', function (user) {
	return {
		link: function (scope, elem, attrs) {
			if (user.checkForNickRegex().test(attrs.messageMention)) {
				elem.addClass('message-mention');
			}
		}
	}
});
