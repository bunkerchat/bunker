app.factory('bunkerApi', function (sailsResource) {
	return {
		user: sailsResource('user'),
		message: sailsResource('message', {
			query: {method: 'GET', isArray: true, cache: false}
		}),
		room: sailsResource('room', {
			join: {method: 'POST'}
		})
	};
});
