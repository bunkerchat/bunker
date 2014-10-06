window.app = angular.module('bunker', [
	'ngSanitize',
	'sailsResource',
	'ui.router',
	'ui.gravatar',
	'angularMoment'
])
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
})
.config(function($compileProvider) {
	// This is where we might customize the sanitize whitelist some day
	// $compileProvider.imgSrcSanitizationWhitelist();
});