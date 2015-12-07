window.app = angular.module('bunkerMobile', [
	'ui.router',
	'ui.gravatar',
	'notification'
])
	.config(function ($stateProvider, $urlRouterProvider) {

		$urlRouterProvider.otherwise('/');
		$stateProvider
			.state('lobby', {
				url: '/',
				templateUrl: '/assets/app/mobile/lobby/lobby.html',
				controller: 'LobbyController as lobby'
			})
	})
	.run(function ($rootScope, $document, bunkerListener, bunkerData, $q) {

		//// html5 visibility api instead of win.focus or win.blur
		//$document.on('visibilitychange', function () {
		//	$rootScope.$broadcast(document.hidden ? 'visibilityHide' : 'visibilityShow');
		//});
		//
		//$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
		//	$rootScope.roomId = toParams.roomId || null;
		//	$rootScope.$broadcast('roomIdChanged', $rootScope.roomId);
		//});

		var socket = io.connect();
		socket.on('connect', function () {
			console.log('socket connected');
		});

		io.socket = sailsApiWrapper(socket, $q);

		// Can't put this bunkerListener init in the `connect` closure or it causes duplication of messages
		// per https://github.com/socketio/socket.io/issues/430
		bunkerListener.init();
		bunkerData.start();
	});

function sailsApiWrapper(socket, $q) {
	socket.emitAsync = function (endpoint, _data) {
		var data = _.isObject(_data) ? _data : undefined;
		return $q(function (resolve, reject) {
			socket.emit(endpoint, data, function (returnData) {
				if (returnData && returnData.serverErrorMessage) return reject(returnData);
				resolve(returnData);
			});
		})
	};
	return socket;
}


