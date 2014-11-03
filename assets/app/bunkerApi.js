app.factory('bunkerApi', function (sailsResource, $resource) {
	return {
		user: sailsResource('user', {
			activity: {method: 'PUT', url: '/user/current/activity'}
		}),
		message: sailsResource('message', {
			query: {method: 'GET', isArray: true, cache: false, fetchAfterReconnect: true},
			update: {method: 'PUT', isArray: false, cache: false, fetchAfterReconnect: false}
		}),
		history: $resource('/message/history'),
		room: sailsResource('room', {
			get: { method: 'GET', fetchAfterReconnect: true }
		}),
		userSettings: sailsResource('userSettings')
	};
});
