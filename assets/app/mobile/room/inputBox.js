app.component('inputBox', {
	templateUrl: '/assets/app/mobile/room/input-box.html',
	bindings: {
		roomId: '@',
		text: '='
	},
	controller: function (bunkerData) {
		this.sendMessage = function () {
			if (!this.text) return;
			bunkerData.createMessage(this.roomId, this.text);
			delete this.text;
		};

		$(window).scroll(_.debounce(function () {
			// while scrolling
			$('input-box').hide();
		}, 150, {'leading': true, 'trailing': false}));

		$(window).scroll(_.debounce(function () {
			// stopped scrolling
			position();
		}, 150));

		$('input-box input').blur(position);
		$('input-box input').focus(position);
		position();

		function position() {
			$('input-box')
				.css({
					position: 'absolute',
					top: window.scrollY + window.innerHeight - $('input-box').height() + 'px'
				})
				.show();
		}
	}
});
