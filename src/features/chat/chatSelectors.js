import { createSelector } from "@reduxjs/toolkit";
import { getTotalUnreadMessageCount } from "../message/messageSelectors.js";
import { getActiveRoom } from "../room/roomSelectors.js";
import { getLocalRoomMembersByRoom } from "../users/usersSelectors.js";

export const hasAnyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.some(localRoomMembersByRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention)
);

export const getDocumentTitle = createSelector(
	[getTotalUnreadMessageCount, hasAnyUnreadMention, getActiveRoom],
	(totalUnreadMessageCount, anyUnreadMention, activeRoom = {}) => {
		const unread = totalUnreadMessageCount > 0 ? `${anyUnreadMention ? "*" : ""}(${totalUnreadMessageCount}) ` : "";
		const roomName = activeRoom.name;
		const leading = `${unread}${roomName}`;
		const leadingBreak = leading ? " - " : "";
		return `${leading}${leadingBreak}Bunker`;
	}
);
