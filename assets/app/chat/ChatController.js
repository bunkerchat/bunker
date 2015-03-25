app.controller('ChatController', function ($rootScope, $stateParams, $state, user) {
	this.memberships = user.memberships;

	$rootScope.$on('$stateChangeStart', function (evt, toState, toParams, fromState) {
		//if(toState.name === 'chat' && fromState.name === 'chat') {
		//	//evt.preventDefault();
		//}
		//console.log(toState);
	});
});
