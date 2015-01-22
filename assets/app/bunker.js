window.app = angular.module('bunker', [
	'ngSanitize',
	'sailsResource',
	'ui.router',
	'ui.gravatar',
	'angularMoment',
	'ui.bootstrap',
	'youtube-embed',
	'angular.filter'
])
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/assets/app/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
			.state('room', {
				url: '/rooms/{roomId}',
				templateUrl: '/assets/app/room/room.html',
				controller: 'RoomController as room',
				resolve: {
					currentRoom: function ($stateParams, rooms) {
						// Angular UI router will complete this before creating the controller if a $promise is returned
						var currentRoom = rooms.get($stateParams.roomId);
						return currentRoom.$resolved ? currentRoom : currentRoom.$promise;
					}
				}
			})
			.state('roomHistory', {
				url: '/rooms/{roomId}/history?date&message',
				templateUrl: '/assets/app/room/roomHistory.html',
				controller: 'RoomHistoryController as room',
				resolve: {
					currentUser: function (user) {
						return user.current.$promise;
					}
				}
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
	.run(function ($rootScope, $document, user) {
		// html5 visibility api instead of win.focus or win.blur
		$document.on("visibilitychange", function () {
			$rootScope.$broadcast(document.hidden ? 'visibilityHide': 'visibilityShow');
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
	});
