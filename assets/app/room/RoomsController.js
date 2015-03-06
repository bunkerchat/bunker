app.controller('RoomsController', function ($rootScope, $stateParams, $state, user, rooms) {
	this.memberships = user.memberships;
});
