window.app = angular.module('bunkerMobile', [
		'ui.router',
		'ui.gravatar',
		'angularMoment',
		'notification'
	])
	.config(function ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/assets/app/mobile/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
			.state('room', {
				url: '/room/{roomId}',
				templateUrl: '/assets/app/mobile/room/room.html',
				controller: 'RoomController as room'
			});

	})
	.run(function ($rootScope, $document, bunkerListener, bunkerData, $q) {

		var socket = io.connect();
		socket.on('connect', function () {
			console.log('socket connected');
		});

		io.socket = sailsApiWrapper(socket, $q);

		// Can't put this bunkerListener init in the `connect` closure or it causes duplication of messages
		// per https://github.com/socketio/socket.io/issues/430
		bunkerListener.init();
		bunkerData.start();
	})
	.run(function () {

		// bunch of hacks to make scrolling and input focus work on mobile

		var focused = false;
		var inputBoxHeight;

		$(window).scroll(_.debounce(function () {
			// while scrolling
		}, 150, {'leading': true, 'trailing': false}));

		$(window).scroll(_.debounce(function () {
			// stopped scrolling
			position();
		}, 150));

		$(document)
			.on('focus', 'input', function () {
				focused = true;
				position();
				setTimeout(function () {
					$(window).scroll();
				}, 5);
			})
			.on('blur', 'input', function () {
				focused = false;
				unposition();
			});

		function position() {
			if (!focused) return;

			inputBoxHeight = $('input-box').outerHeight() || inputBoxHeight;

			$('input-box').css({
				position: 'absolute',
				top: (window.scrollY + window.innerHeight - inputBoxHeight) + 'px'
			});
		}

		function unposition() {
			$('input-box').css({
				position: 'fixed',
				top: 'initial',
				bottom: '0'
			});
		}
	});

function sailsApiWrapper(socket, $q) {
	socket.emitAsync = function (endpoint, _data) {
		var data = _.isObject(_data) ? _data : undefined;
		return $q(function (resolve, reject) {
			socket.emit(endpoint, data, function (returnData) {
				if (returnData && returnData.serverErrorMessage) return reject(returnData);
				resolve(returnData);
			});
		})
	};
	return socket;
}


