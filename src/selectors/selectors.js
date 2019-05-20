import { createSelector } from "reselect";

const getUsers = state => state.users;
export const getLocalUser = state => state.localUser;
const getRooms = state => state.rooms;
const getLocalRoomMembersByRoom = state => state.localRoomMembers.byRoom;
const getMessagesByRoom = state => state.messages.byRoom;
export const getAuthorUser = (state, props) => state.users[props.authorId];
export const getMessageAuthor = (state, props) => state.users[props.message.author];

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
	[getActiveRoom, getMessagesByRoom, getLocalUser],
	(room, messagesByRoom, localUser) => {
		if (!room) return [];
		return _.filter(messagesByRoom[room._id], { author: localUser._id });
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
