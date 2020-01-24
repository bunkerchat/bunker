import { createSelector } from "@reduxjs/toolkit";
import { getLocalUserPresent, getNick, getUsers } from "../users/usersSelectors.js";
import { getRooms } from "../room/roomSelectors.js";
import { getLastMessage } from "../message/messageSelectors.js";

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

export const getLastMentionAuthorNick = createSelector(
	[getLastMessageContainsMention, getUsers],
	(lastMessageMention = {}, users = {}) => users[lastMessageMention.author]?.nick
);

export const getDesktopMentionNotifications = state => state.userSettings?.desktopMentionNotifications;
