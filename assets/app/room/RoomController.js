app.controller('RoomController', function ($scope, $stateParams, rooms) {
	var self = this;

	var roomId = $stateParams.roomId;

	this.current = rooms(roomId);

	$scope.$watch(function(){
			return JSON.stringify(awesomeWatch());
		},
	function(usersReducedJson, oldListJson){


		if(usersReducedJson == "{}" || oldListJson == "{}") return;

		var usersReduced = JSON.parse(usersReducedJson);
		var oldList = JSON.parse(oldListJson);

		console.log(usersReduced)
		console.log(oldList);




		_.each(usersReduced, function(user){
			if(user.lastActivity != oldList[user.id].lastActivity){
				$scope.$broadcast(user.id, user);
			}
		});
	});


	function awesomeWatch(){
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
