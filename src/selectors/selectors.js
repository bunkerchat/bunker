import { createSelector } from "@reduxjs/toolkit";

const getUsers = state => state.users;
export const getLocalUser = state => state.localUser;
const getRooms = state => state.rooms;
const getLocalRoomMembersByRoom = state => state.localRoomMembers.byRoom;
const getMessagesByRoom = state => state.messages.byRoom;
const getLocalUserPresent = state => state.localUser.present;
export const getAuthorUser = (state, props) => state.users[props.authorId];
export const getMessageAuthor = (state, props) => state.users[props.message.author];
export const getLastMessage = state => state.messages.lastMessage;
export const getNick = state => state.localUser.nick;
export const getDesktopMentionNotifications = state => state.userSettings?.desktopMentionNotifications;
export const getShowDesktopNotification = state => state.notifications.showDesktop;

export const getRoomIds = createSelector([getRooms], (rooms = {}) => Object.keys(rooms));

export const getActiveRoom = createSelector([getRooms], rooms => _.find(rooms, { current: true }));

export const getActiveRoomId = createSelector([getActiveRoom], (activeRoom = {}) => activeRoom._id);

export const getTotalUnreadMessageCount = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.reduce(localRoomMembersByRoom, (count, roomMember) => count + (roomMember.unreadMessageCount || 0), 0)
);

export const hasAnyUnreadMention = createSelector([getLocalRoomMembersByRoom], localRoomMembersByRoom =>
	_.some(localRoomMembersByRoom, roomMember => roomMember.unreadMessageCount > 0 && roomMember.unreadMention)
);

export const getRoomMembers = createSelector(
	[getActiveRoomId, getRooms],
	(activeRoomId, rooms = {}) => (rooms[activeRoomId] || {}).$members
);

export const getRoomTopic = createSelector([getActiveRoom], room => {
	if (!room) return;
	return {
		tokens: room.topicTokens,
		text: room.topic
	};
});

const getChatByRoom = state => state.chatInput.byRoom;

export const getLocalMessages = createSelector(
	[getActiveRoomId, getMessagesByRoom, getLocalUser],
	(activeRoomId, messagesByRoom, localUser) => {
		if (!activeRoomId) return [];
		return _.filter(messagesByRoom[activeRoomId], { author: localUser._id });
	}
);

const getChatForCurrentRoom = createSelector(
	[getActiveRoomId, getChatByRoom],
	(activeRoomId, chatByRoomId) => chatByRoomId[activeRoomId]
);

export const getTextForCurrentRoom = createSelector(
	[getChatForCurrentRoom],
	(getChatForCurrentRoom = {}) => getChatForCurrentRoom.text
);

export const getCurrentRoomTextEmpty = createSelector([getTextForCurrentRoom], (text = "") => text.length === 0);

export const getEditedMessageForCurrentRoom = createSelector(
	[getChatForCurrentRoom],
	(getChatForCurrentRoom = {}) => getChatForCurrentRoom.editedMessage
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

export const getSortedRoomMemberUserIds = createSelector([getSortedRoomMemberUsers], roomMemberUsers =>
	roomMemberUsers.map(roomMemberUser => roomMemberUser.user)
);

export const getRoomMembersForCurrentRoomHash = createSelector([getRoomMembers], roomMembers =>
	_.keyBy(roomMembers, "user")
);

export const getRoomMemberRoleForCurrentRoomByUserId = userId =>
	createSelector([getRoomMembersForCurrentRoomHash], roomMembersHash => roomMembersHash[userId]?.role);

export const getLastMessageContainsMention = createSelector([getLastMessage, getNick], (lastMessage, nick) => {
	if (!lastMessage) return;

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

export const getLastMentionAuthorNick = createSelector(
	[getLastMessageContainsMention, getUsers],
	(lastMessageMention = {}, users = {}) => users[lastMessageMention.author]?.nick
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
