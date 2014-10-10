app.factory('user', function(bunkerApi, rooms) {
	return {
		current: bunkerApi.user.get({id: 'current'})
	}
});
