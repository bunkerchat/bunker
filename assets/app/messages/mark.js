app.directive('mark', function () {
	return {
		restrict:'EA',
		link: function ($scope, $elem) {
			$elem.on('click', () => {
				$elem.toggleClass('toggle-mark')
			})
		}
	}
})
