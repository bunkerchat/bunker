window.app = angular.module('bunker', [
	'ngTouch',
	'ngSanitize',
	'ui.router',
	'ui.gravatar',
	'angularMoment',
	'ui.bootstrap',
	'youtube-embed',
	'angular.filter',
	'hljs',
	'plangular', /* soundcloud embed */
	'notification',
	'angularStats',
	'as.sortable'
])
	.config(function ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/rooms');
		$stateProvider
			.state('chat', {
				abstract: true,
				url: '/rooms',
				templateUrl: '/assets/app/chat/chat.html',
				controller: 'ChatController as chat'
			})

			// Having these be a child states stops the state from reloading view
			// The 'chat' state/controller/view will be in use

			.state('chat.lobby', {
				url: ''
			})
			.state('chat.room', {
				url: '/{roomId}'
			})
			.state('roomHistory', {
				url: '/rooms/{roomId}/history?date&message',
				templateUrl: '/assets/app/room/roomHistory.html',
				controller: 'RoomHistoryController as room'
			});
	})
	.config(function ($compileProvider, gravatarServiceProvider) {
		// disable debug info
		$compileProvider.debugInfoEnabled(window.debugging || !window.useJavascriptBundle);

		gravatarServiceProvider.defaults = {
			'default': 'identicon'
		}
	})
	.run(function ($rootScope, $document, bunkerListener, bunkerData, $q, $log, $timeout) {

		// html5 visibility api instead of win.focus or win.blur
		$document.on('visibilitychange', function () {
			$rootScope.$broadcast(document.hidden ? 'visibilityHide' : 'visibilityShow');
		});

		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
			$rootScope.roomId = toParams.roomId || null;
			$rootScope.$broadcast('roomIdChanged', $rootScope.roomId);
		});

		var socket = io.connect();

		io.socket = socket;
		io.socket.emitAsync = function (endpoint, _data) {
			var data = _.isObject(_data) ? _data : undefined;
			return $q(function (resolve, reject) {
				$timeout(function () {
					socket.emit(endpoint, data, function (returnData) {
						if (returnData && returnData.serverErrorMessage) {
							$log.error(returnData.serverErrorMessage, {endpoint: endpoint, data: data, returnData: returnData});
							return reject(returnData);
						}
						resolve(returnData);
					});
				}, 50);
			})
				.catch(err => {
					console.log('server error', err)
					throw err
				});
		};

		// Can't put this bunkerListener init in the `connect` closure or it causes duplication of messages
		// per https://github.com/socketio/socket.io/issues/430
		bunkerListener.init();
		bunkerData.start();
	});


$("body").on("click", "[room] img.emoticon", function (evt) {
	var emoticon = $(evt.target);
	var original = emoticon.attr('title');
	emoticon.after(`<span>${original}</span>`);
	emoticon.remove();
});
