app.controller('RoomController', function ($scope, $stateParams, rooms) {
	var self = this;

	var roomId = $stateParams.roomId;

	this.current = rooms(roomId);

	//Tell the users lists about our update (away status) - DB
	$scope.$watch(function(){
		return JSON.stringify(resolvedRoom());
	},
	function(usersReducedJson, oldListJson){
		if(usersReducedJson == "{}" || oldListJson == "{}") return;

		var usersReduced = JSON.parse(usersReducedJson);
		var oldList = JSON.parse(oldListJson);

		_.each(usersReduced, function(user){
			if(user.lastActivity != oldList[user.id].lastActivity){
				$scope.$broadcast(user.id, user);
			}
		});
	});


	function resolvedRoom(){
		if(!self.current.$resolved){
			return {};
		}
		return _.indexBy(self.current.members.map(function(user){
			return {
				id: user.id,
				lastActivity: user.lastActivity
			};
		}), "id");
	}
});
