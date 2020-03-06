import { createSelector } from "@reduxjs/toolkit";
import { getTotalUnreadMessageCount } from "../message/messageSelectors.js";
import { getActiveRoomName } from "../room/roomSelectors.js";
import { getLocalRoomMembersByRoom } from "../users/usersSelectors.js";

export const hasAnyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.some(localRoomMembersByRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention)
);

export const getDocumentTitle = createSelector(
	[getTotalUnreadMessageCount, hasAnyUnreadMention, getActiveRoomName],
	(totalUnreadMessageCount, anyUnreadMention, activeRoomName = "Lobby") => {
		const unread = totalUnreadMessageCount > 0 ? `${anyUnreadMention ? "*" : ""}(${totalUnreadMessageCount}) ` : "";
		const leading = `${unread}${activeRoomName}`;
		const leadingBreak = leading ? " - " : "";
		return `${leading}${leadingBreak}Bunker`;
	}
);
