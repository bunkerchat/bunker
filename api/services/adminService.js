module.exports.changeUserRoleInRoom = function (userNick, roomId, role) {
	return User.find({nick: userNick})
		.then(function (users) {
			var userIds = users.map(function (user) {
				return user.id;
			});

			return RoomMember.findOne({user: userIds, room: roomId}).populateAll();
		})
		.then( function (roomMemberToPromote) {
			if (!roomMemberToPromote) throw new Error('User not found');

			return RoomMember.update(roomMemberToPromote.id, {role: role});
		})
};
