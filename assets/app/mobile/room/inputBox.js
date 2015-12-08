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

		//atempt 3ish
		//$(window).scroll(_.debounce(function () {
		//	// while scrolling
		//	$('input-box').hide();
		//}, 150, {'leading': true, 'trailing': false}));
		//
		//$(window).scroll(_.debounce(function () {
		//	// stopped scrolling
		//	position();
		//}, 150));
		//
		//$('input-box input').blur(position);
		//$('input-box input').focus(position);
		//position();


		var focused = false;

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

		$(window).scroll(position);

		//attempt 5ish
		$(document)
			.on('focus', 'input', function () {
				focused = true;
				//$('body').addClass('fixfixed');
				$timeout(position, 1000);
				//position();
			})
			.on('blur', 'input', function () {
				focused = false;
				//$('body').removeClass('fixfixed');
				unposition();
			});
	}
});
