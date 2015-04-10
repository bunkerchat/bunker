app.directive('messageMention', function (bunkerData) {
	return {
		link: function (scope, elem, attrs) {
			if (bunkerData.mentionsUser(attrs.messageMention)) {
				elem.addClass('message-mention');
			}
		}
	};
});
