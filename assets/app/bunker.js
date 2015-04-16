window.app = angular.module('bunker', [
	'ngSanitize',
	'ui.router',
	'ui.gravatar',
	'angularMoment',
	'ui.bootstrap',
	'youtube-embed',
	'angular.filter',
	'hljs',
	'plangular', /* soundcloud embed */
	'notification',
	'ngAudio',
	'angularStats'
])
	.config(function ($stateProvider, $urlRouterProvider) {

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
			.state('inbox', {
				url: '/inbox',
				templateUrl: '/assets/app/inbox/list.html',
				controller: 'InboxController as inbox'
			})
			.state('roomHistory', {
				url: '/rooms/{roomId}/history?date&message',
				templateUrl: '/assets/app/room/roomHistory.html',
				controller: 'RoomHistoryController as room'
			});
	})
	.config(function ($compileProvider, gravatarServiceProvider, hljsServiceProvider) {
		// disable debug info
		$compileProvider.debugInfoEnabled(window.debugging || !window.isProduction);

		// to reenable in prod, use
		// angular.reloadWithDebugInfo()

		gravatarServiceProvider.defaults = {
			'default': 'identicon'
		};

		hljsServiceProvider.setOptions({
			// cs and scala are weird
			languages: [
				'css',
				'javascript',
				'bash',
				//'cs', // c# ?
				'json',
				'xml',
				'java',
				'objectivec',
				//'scala',
				'markdown',
				'lisp'
			]
		});
	})
	.run(function ($rootScope, $document, bunkerListener) {

		// html5 visibility api instead of win.focus or win.blur
		$document.on('visibilitychange', function () {
			$rootScope.$broadcast(document.hidden ? 'visibilityHide' : 'visibilityShow');
		});

		$rootScope.$on('$stateChangeSuccess', function (event, toState, toParams) {
			$rootScope.roomId = toParams.roomId || null;
			$rootScope.$broadcast('roomIdChanged', $rootScope.roomId);
		});

		bunkerListener.init();
	});
