app.directive('gfycat', function ($http) {
	return {
		link: function (scope, el, attr) {
			var id = attr.gfycat;
			$http.get('http://gfycat.com/cajax/get/' + id)
				.then(function (response) {
					var data = response.data.gfyItem;
					el.append('<iframe src="http://gfycat.com/ifr/' + id + '" ' +
						'frameborder="0" scrolling="no" width="' + data.width + '" height="' + data.height + '" ' +
						'style="-webkit-backface-visibility: hidden;-webkit-transform: scale(1);" >' +
						'</iframe>')
				});
		}
	}
});
