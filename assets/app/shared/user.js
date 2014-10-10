app.factory('user', function(bunkerApi) {
	return {
		current: bunkerApi.user.get({id: 'current'})
	};
});
