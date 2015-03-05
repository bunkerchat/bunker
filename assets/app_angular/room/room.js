app.directive('roomid', function () {
	return {
		//replace:true,
		scope:{
			roomId:'@roomid'
		},
		templateUrl:'/assets/app/room/room.html',
		controller:'RoomController as room'
	}
});