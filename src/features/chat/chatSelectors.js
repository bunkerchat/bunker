import { createSelector } from "@reduxjs/toolkit";
import { getTotalUnreadMessageCount } from "../message/messageSelectors.js";
import { getActiveRoom } from "../room/roomSelectors.js";
import { getLocalRoomMembersByRoom } from "../users/usersSelectors.js";

export const getSection = state => {
	const sectionMatch = /2\/(\w+)/.exec(state.router.location.pathname);
	return sectionMatch ? sectionMatch[1] : null;
};

export const hasAnyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.some(localRoomMembersByRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention)
);

export const getDocumentTitle = createSelector(
	[getTotalUnreadMessageCount, hasAnyUnreadMention, getSection, getActiveRoom],
	(totalUnreadMessageCount, anyUnreadMention, section, activeRoom = {}) => {
		const unread = totalUnreadMessageCount > 0 ? `${anyUnreadMention ? "*" : ""}(${totalUnreadMessageCount}) ` : "";
		const roomName = activeRoom.name || (section === "settings" && "Settings") || "";
		const leading = `${unread}${roomName}`;
		const leadingBreak = leading ? " - " : "";
		return `${leading}${leadingBreak}Bunker`;
	}
);
