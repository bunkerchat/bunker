app.factory('bunkerApi', function (sailsResource) {
	return {
		message: sailsResource('message', {
			query: {method: 'GET', isArray: true, cache: false}
		})
	};
});