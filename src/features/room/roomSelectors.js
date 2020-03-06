import { createSelector } from "@reduxjs/toolkit";
import { getLocalRoomMembersByRoom } from "../users/usersSelectors.js";

export const getRooms = state => state.rooms;

export const getRoomIds = createSelector([getRooms], (rooms = {}) => Object.keys(rooms));

export const getActiveRoomId = state => state.room.activeRoomId;

export const getActiveRoom = state => getRooms(state)[getActiveRoomId(state)];

export const getRoomName = roomId => state => getRooms(state)[roomId]?.name;

export const getActiveRoomName = state => getActiveRoom(state)?.name;

export const getRoomIsCurrent = roomId => state => getActiveRoomId(state) === roomId;

export const getRoomIsLoading = state => getActiveRoom(state)?.loading;

export const getRoomFullHistoryLoaded = state => getActiveRoom(state)?.fullHistoryLoaded;

export const getUnreadRoomIds = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_(localRoomMembersByRoom)
		.filter(roomMember => roomMember.unreadMessageCount > 0)
		.orderBy(["unreadStart"])
		.map("room")
		.value()
);

export const getReadRoomIds = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_(localRoomMembersByRoom)
		.filter(roomMember => !roomMember.unreadMessageCount)
		.sortBy("roomOrder")
		.map("room")
		.value()
);

export const getRoomTopic = createSelector([getActiveRoom], room => {
	if (!room) return;
	return {
		tokens: room.topicTokens,
		text: room.topic
	};
});
