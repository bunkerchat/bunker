app.factory('rooms', function() {
	var roomService = {
		current: null
	};

	Object.defineProperty(roomService, 'memberLookup', {
		get: _.throttle(function () {
			if (!this.current) return {};
console.count('memberlookup')
			return _.indexBy(this.current.members, 'id');
		},250)

	});

	return roomService;
});
