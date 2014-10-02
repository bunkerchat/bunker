window.app = angular.module('bunker', ['sailsResource', 'ui.router', 'ui.gravatar'])
	.config(function ($stateProvider, $urlRouterProvider) {
		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/app/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
			.state('room', {
				url: '/rooms/{roomId}',
				templateUrl: '/app/room/room.html',
				controller: 'RoomController as room'
			});
	});