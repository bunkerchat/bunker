app.factory('bunkerApi', function (sailsResource) {
	return {
		user: sailsResource('user', {
			activity: {method: 'PUT', url: '/user/current/activity'}
		}),
		userSettings: sailsResource('userSettings'),
		roomMember: sailsResource('roomMember'),
		message: sailsResource('message', {
			update: {method: 'PUT', isArray: false, cache: false},
			emoticonCounts: {method: 'GET', isArray: true, cache: false, url: '/message/emoticonCounts'}
		}),
		room: sailsResource('room', {
			get: {method: 'GET', fetchAfterReconnect: true},
			leave: {method: 'PUT', url: '/room/leave'},
			latest: {method: 'GET', isArray: true, cache: false, url: '/room/:roomId/latest', fetchAfterReconnect: true},
			history: {method: 'GET', isArray: true, url: '/room/:roomId/history'}
		})
	};
});
