app.factory('user', function(bunkerApi) {
	return bunkerApi.user.get({id: 'current'});
});