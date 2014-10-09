app.factory('bunkerApi', function (sailsResource) {
	return {
		user: sailsResource('user'),
		message: sailsResource('message', {
			query: {method: 'GET', isArray: true, cache: false, fetchAfterReconnect: true}
		}),
		room: sailsResource('room', {
			get: { method: 'GET', fetchAfterReconnect: true }
		})
	};
});
