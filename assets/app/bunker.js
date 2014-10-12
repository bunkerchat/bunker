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
				controller: 'RoomController as roomCtrl',
				resolve: {
					current: function($stateParams, bunkerApi, roomService) {
						var roomId = $stateParams.roomId;
						return bunkerApi.room.get({id: roomId}, function(room){
							roomService.current = room;
						}).$promise;
					},
					bunkerApi: 'bunkerApi',
					roomService: 'rooms'
				}
			})
			.state('emoticons', {
				url: '/emoticons',
				templateUrl: '/assets/app/emoticons/emoticons.html',
				controller: 'EmoticonsListController as emoticonsListCtrl'
			});
	})
	.config(function ($compileProvider) {
		// This is where we might customize the sanitize whitelist some day
		// $compileProvider.imgSrcSanitizationWhitelist();
	});
