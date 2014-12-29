app.factory('bunkerApi', function (sailsResource) {
	return {
		user: sailsResource('user', {
			activity: {method: 'PUT', url: '/user/current/activity'}
		}),
		userSettings: sailsResource('userSettings'),
		roomMember: sailsResource('roomMember'),
		message: sailsResource('message', {
			emoticonCounts: {method: 'GET', isArray: true, cache: false, url: '/message/emoticonCounts'}
		}),
		room: sailsResource('room', {
			join: {method: 'GET', cache: false, url: '/room/:id/join', fetchAfterReconnect: true},
			leave: {method: 'PUT', url: '/room/:id/leave'},
			messages: {method: 'GET', isArray: true, cache: false, url: '/room/:id/messages', fetchAfterReconnect: true},
			history: {method: 'GET', isArray: true, url: '/room/:id/history'}
		})
	};
});
