app.factory('bunkerApi', function (sailsResource, $resource) {
	return {
		user: sailsResource('user'),
		message: sailsResource('message', {
			query: {method: 'GET', isArray: true, cache: false, fetchAfterReconnect: true}
		}),
		history: $resource('/message/history'),
		room: sailsResource('room', {
			get: { method: 'GET', fetchAfterReconnect: true }
		})
	};
});
