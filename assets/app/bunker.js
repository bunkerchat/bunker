window.app = angular.module('bunker', [
	'ngSanitize',
	'sailsResource',
	'ui.router',
	'ui.gravatar',
	'angularMoment'
])
	.config(function ($stateProvider, $urlRouterProvider) {

		var currentUser = function(bunkerApi, $q) {

			var def = $q.defer();
			bunkerApi.user.get({id: 'current'}, function (user) {
				def.resolve(user);
			});

			return def.promise;
		};

		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/assets/app/lobby/lobby.html',
				controller: 'LobbyController as lobby',
				resolve: {
					currentUser: currentUser
				}
			})
			.state('room', {
				url: '/rooms/{roomId}',
				templateUrl: '/assets/app/room/room.html',
				controller: 'RoomController as room',
				resolve: {
					currentRoom: function($stateParams, bunkerApi, roomService, $q) {

						var roomId = $stateParams.roomId,
							def = $q.defer();

						return currentUser(bunkerApi, $q)
							.then(function(user) {
								bunkerApi.room.get({id: roomId}, function (room) {
									roomService.room = room;
									def.resolve();

									var existingMember = _.any(user.rooms, {id: roomId});
									if (!existingMember) {
										user.rooms.push(room);
									}
								});

								return def.promise;
							});
					},
					bunkerApi: 'bunkerApi',
					roomService: 'room'
				}
			});
	})
	.config(function ($compileProvider) {
		// This is where we might customize the sanitize whitelist some day
		// $compileProvider.imgSrcSanitizationWhitelist();
	});
