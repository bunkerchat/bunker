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
				templateUrl: '/assets/app/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
			.state('room', {
				url: '/rooms/{roomId}',
				templateUrl: '/assets/app/room/room.html',
				controller: 'RoomController as room',
				resolve: {
					currentRoom: function($stateParams, bunkerApi, roomService, user) {

						var roomId = $stateParams.roomId;

						return bunkerApi.room.get({id: roomId}, function (room) {
							roomService.room = room;
							var existingMember = _.any(user.rooms, {id: roomId});
							if (!existingMember) {
								user.rooms.push(room);
							}
						});
					},
					bunkerApi: 'bunkerApi',
					roomService: 'room',
					user: 'user'
				}
			});
	})
	.config(function ($compileProvider) {
		// This is where we might customize the sanitize whitelist some day
		// $compileProvider.imgSrcSanitizationWhitelist();
	});
