import { createSelector } from "@reduxjs/toolkit";
import { getLocalRoomMembersByRoom, getLocalUser } from "../users/usersSelectors.js";
import { getActiveRoomId } from "../room/roomSelectors.js";

export const getMessagesByRoom = state => state.messages.byRoom;

export const getLastMessage = state => state.messages.lastMessage;

export const getTotalUnreadMessageCount = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.reduce(localRoomMembersByRoom, (count, roomMember) => count + (roomMember.unreadMessageCount || 0), 0)
);

export const getLocalMessages = createSelector(
	[getActiveRoomId, getMessagesByRoom, getLocalUser],
	(activeRoomId, messagesByRoom, localUser) => {
		if (!activeRoomId) return [];
		return _.filter(messagesByRoom[activeRoomId], { author: localUser._id });
	}
);

export const getMessageById = messageId => state => state.messages.byKey[messageId];
export const getMessageText = messageId => state => getMessageById(messageId)(state).text;
export const getMessageAuthorId = messageId => state => getMessageById(messageId)(state).author;
