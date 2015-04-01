window.app = angular.module('bunker', [
	'ngSanitize',
	'sailsResource',
	'ui.router',
	'ui.gravatar',
	'angularMoment',
	'ui.bootstrap',
	'youtube-embed',
	'angular.filter',
	'hljs',
	'plangular', /* soundcloud embed */
	'notification',
	'ngAudio'
])
	.config(function (sailsResourceProvider, $stateProvider, $urlRouterProvider) {
		sailsResourceProvider.configuration = {
			verbose: false
		};

		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/assets/app/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
			.state('chat', {
				abstract: true,
				url: '/rooms',
				templateUrl: '/assets/app/chat/chat.html',
				controller: 'ChatController as chat'
			})
			.state('chat.room', {
				// Having this be a child state stops the state from reloading view
				// The 'chat' state/controller/view will be in use
				url: '/{roomId}'
			})
			.state('roomHistory', {
				url: '/rooms/{roomId}/history?date&message',
				templateUrl: '/assets/app/room/roomHistory.html',
				controller: 'RoomHistoryController as room'
			});
	})
	.config(function ($compileProvider) {
		// This is where we might customize the sanitize whitelist some day
		// $compileProvider.imgSrcSanitizationWhitelist();


		// disable debug info
		$compileProvider.debugInfoEnabled(!window.isProduction);

		// to reenable in prod, use
		// angular.reloadWithDebugInfo()
	})
	.config(function (gravatarServiceProvider) {
		gravatarServiceProvider.defaults = {
			'default': 'identicon'
		};
	})
	.run(function ($rootScope, $document, user, $window, bunkerListener) {
		// html5 visibility api instead of win.focus or win.blur
		$document.on("visibilitychange", function () {
			$rootScope.$broadcast(document.hidden ? 'visibilityHide' : 'visibilityShow');
		});

		// Handle user away notification on window focus/blur
		$rootScope.$on('visibilityShow', function () {
			user.current.present = true;
			user.current.lastActivity = new Date().toISOString();
			user.current.$activity();
		});

		$rootScope.$on('visibilityHide', function () {
			user.current.present = false;
			user.current.lastActivity = new Date().toISOString();
			user.current.$activity();
		});

		$rootScope.$on('$sailsConnected', function () {
			user.current.$connect();
		});

		// watch room ids change
		$rootScope.$watch(function () {
			return $window.location.hash;
		}, function (newVal, oldVal) {
			var newMatch = /^#\/rooms\/([A-z0-9]*)(?:.*)?$/g.exec(newVal) || [];
			var oldMatch = /^#\/rooms\/([A-z0-9]*)(?:.*)?$/g.exec(oldVal) || [];

			$rootScope.roomId = newMatch[1];
			$rootScope.$broadcast('roomIdChanged', newMatch[1], oldMatch[1]);
		});

		bunkerListener.init();
	});
