window.app = angular.module('bunker', [
	'ngSanitize',
	'sailsResource',
	'ui.router',
	'ui.gravatar',
	'angularMoment',
	'ngResource',
	'ui.bootstrap'
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
						return rooms($stateParams.roomId).$promise;
					}
				}
			})
			.state('roomHistory', {
				url: '/rooms/{roomId}/history?date',
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
	})
	.config(function (gravatarServiceProvider) {
		gravatarServiceProvider.defaults = {
			'default': 'identicon'
		};
	});
