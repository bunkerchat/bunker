export const totalUnreadMessageCount = (state) => _.reduce(
	state.localRoomMembers.byRoom,
	(count, roomMember) => count + (roomMember.unreadMessageCount || 0),
	0
);
