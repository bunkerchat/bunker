import { createSelector } from "@reduxjs/toolkit";
import { getActiveRoom, getActiveRoomId, getRooms } from "../features/room/roomSelectors.js";
import { getRoomMembers, getSortedRoomMemberUsers } from "../features/roomMember/roomMemberSelectors.js";
import { getLastMessage, getTotalUnreadMessageCount } from "../features/message/messageSelectors.js";
import { getLocalRoomMembersByRoom, getLocalUserPresent, getNick } from "../features/users/usersSelectors.js";
import { getChatForCurrentRoom } from "../features/chatInput/chatInputSelectors.js";

export const getDesktopMentionNotifications = state => state.userSettings?.desktopMentionNotifications;
export const getShowDesktopNotification = state => state.notifications.showDesktop;

export const hasAnyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.some(localRoomMembersByRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention)
);

export const getRoomTopic = createSelector([getActiveRoom], room => {
	if (!room) return;
	return {
		tokens: room.topicTokens,
		text: room.topic
	};
});

export const getEditedMessageForCurrentRoom = createSelector(
	[getChatForCurrentRoom],
	(chatForCurrentRoom = {}) => chatForCurrentRoom.editedMessage
);

export const getSection = state => {
	const sectionMatch = /2\/(\w+)/.exec(state.router.location.pathname);
	return sectionMatch ? sectionMatch[1] : null;
};

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

export const getSortedRoomMemberUserIds = createSelector([getSortedRoomMemberUsers], roomMemberUsers =>
	roomMemberUsers.map(roomMemberUser => roomMemberUser.user)
);

export const getRoomMembersForCurrentRoomHash = createSelector([getRoomMembers], roomMembers =>
	_.keyBy(roomMembers, "user")
);

export const getRoomMemberRoleForCurrentRoomByUserId = userId =>
	createSelector([getRoomMembersForCurrentRoomHash], roomMembersHash => roomMembersHash[userId]?.role);

export const getLastMessageContainsMention = createSelector([getLastMessage, getNick], (lastMessage, nick) => {
	if (!lastMessage || !lastMessage.tokens) return;

	const hasMention = lastMessage.tokens.some(token => {
		if (token.type !== "word") return false;
		return token.value.toUpperCase().includes(nick.toUpperCase()) || token.value.includes("@all");
	});

	if (hasMention) return lastMessage;
});

export const getShowNotification = createSelector(
	[getLastMessageContainsMention, getLocalUserPresent],
	(lastMessage, localUserPresent) => !!lastMessage && !localUserPresent
);

export const getLastMentionRoomName = createSelector(
	[getLastMessageContainsMention, getRooms],
	(lastMessageMention = {}, rooms = {}) => rooms[lastMessageMention.room]?.name
);

export const getLastMentionText = createSelector(
	[getLastMessageContainsMention],
	(lastMessageMention = {}) => lastMessageMention.text
);

export const getRoomIsCurrent = roomId => createSelector([getActiveRoomId], activeRoomId => activeRoomId === roomId);

export const getRoomName = roomId => state => getRooms(state)[roomId]?.name;

export const getUnreadMention = roomId => state => getLocalRoomMembersByRoom(state)[roomId]?.unreadMention;

export const getUnreadMessageCount = roomId => state => getLocalRoomMembersByRoom(state)[roomId]?.unreadMessageCount;

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

export const getIsDisconnected = state => !state.socket.connected;

export const newIsVersionV2Deployed = ({ version }) =>
	version.clientVersionV2New && version.clientVersionV2 !== version.clientVersionV2New;
