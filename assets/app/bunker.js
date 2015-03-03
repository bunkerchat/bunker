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
	'plangular' /* soundcloud embed */
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
			.state('room', {
				url: '/rooms/{roomId}'
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
	.run(function ($rootScope, $document, user, $window) {
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
			var newMatch = /^#\/rooms\/(.*)$/g.exec(newVal) || [];
			var oldMatch = /^#\/rooms\/(.*)$/g.exec(oldVal) || [];

			$rootScope.$broadcast('roomIdChanged', newMatch[1], oldMatch[1]);
			$rootScope.roomid = newMatch[1];
		});
	});
