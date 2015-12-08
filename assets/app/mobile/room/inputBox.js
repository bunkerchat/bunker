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

		var focused = false;

		$(window).scroll(_.debounce(function () {
			// while scrolling
			//$('input-box').hide();
		}, 150, {'leading': true, 'trailing': false}));

		$(window).scroll(_.debounce(function () {
			// stopped scrolling
			position();
			$('input-box').show();
		}, 150));

		//attempt 5ish
		$(document)
			.on('focus', 'input', function () {
				focused = true;
				position();
				setTimeout(function() { $(window).scroll(); }, 10);
			})
			.on('blur', 'input', function () {
				focused = false;
				unposition();
			});

		function position() {
			if (!focused) return;
			$('input-box').css({
				position: 'absolute',
				top: window.scrollY + window.innerHeight - 46 + 'px'
			});
		}

		function unposition() {
			$('input-box').css({
				position: 'fixed',
				top: 'initial',
				bottom: '0'
			});
		}
	}
});
