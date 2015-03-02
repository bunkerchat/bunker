app.directive('roomid', function () {
	return {
		//replace:true,
		scope:{
			roomid:'@'
		},
		templateUrl:'/assets/app/room/room.html',
		controller:'RoomController as room'
	}
});