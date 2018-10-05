export const totalUnreadMessageCount = state =>
	_.reduce(state.localRoomMembers.byRoom, (count, roomMember) => count + (roomMember.unreadMessageCount || 0), 0);

export const anyUnreadMention = state =>
	_.some(state.localRoomMembers.byRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention);
