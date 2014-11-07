app.factory('bunkerApi', function (sailsResource, $resource) {
	return {
		user: sailsResource('user', {
			activity: {method: 'PUT', url: '/user/current/activity'}
		}),
		userSettings: sailsResource('userSettings'),
		message: sailsResource('message', {
			query: {method: 'GET', isArray: true, cache: false, fetchAfterReconnect: true},
			update: {method: 'PUT', isArray: false, cache: false, fetchAfterReconnect: false}
		}),
		room: sailsResource('room', {
			get: { method: 'GET', fetchAfterReconnect: true },
			leave: { method: 'PUT', url: '/room/leave' },
			latest: {method: 'GET', isArray: true, cache: false, url: '/room/:roomId/latest'},
			history: {method: 'GET', isArray: true, url: '/room/:roomId/history'}
		})
	};
});
