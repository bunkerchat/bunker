import { createSelector } from "@reduxjs/toolkit";
import { getActiveRoomId, getRooms } from "../room/roomSelectors.js";
import { getUsers } from "../users/usersSelectors.js";

export const getRoomMembers = createSelector(
	[getActiveRoomId, getRooms],
	(activeRoomId, rooms = {}) => (rooms[activeRoomId] || {}).$members
);
export const getSortedRoomMemberUsers = createSelector([getUsers, getRoomMembers], (users, roomMembers) => {
	if (!roomMembers) return;

	const emptyUser = { connected: false, present: false, nick: "", empty: true };

	return _.orderBy(
		roomMembers,
		[
			roomMember => (users[roomMember.user] || emptyUser).connected,
			roomMember => (users[roomMember.user] || emptyUser).present,
			roomMember => (users[roomMember.user] || emptyUser).nick.toLowerCase()
		],
		["desc", "desc", "asc"]
	);
});
