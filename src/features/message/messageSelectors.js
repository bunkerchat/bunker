import { createSelector } from "@reduxjs/toolkit";
import { getLocalRoomMembersByRoom, getLocalUser } from "../users/usersSelectors.js";
import { getActiveRoomId } from "../room/roomSelectors.js";
import { isMobile } from "../../constants/browserInfo";
import { getBunkerServesImages } from "../settings/userSettingsSelectors";

export const getMessagesByRoom = state => state.message.byRoom;

export const getLastMessage = state => state.message?.lastMessage;

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

export const getMessageById = messageId => state => state.message.byKey[messageId];
export const getMessageText = messageId => state => getMessageById(messageId)(state)?.text;
export const getMessageAuthorId = messageId => state => getMessageById(messageId)(state)?.author;
export const getMessageCreatedAt = messageId => state => getMessageById(messageId)(state)?.createdAt;
export const getMessageEdited = messageId => state => getMessageById(messageId)(state).edited;
export const getMessageTokens = messageId => state => getMessageById(messageId)(state)?.tokens;
export const getImagesVisible = messageId => state => getMessageById(messageId)(state)?.imagesVisible;
export const getMessageReactions = messageId => state => getMessageById(messageId)(state)?.reactions;
export const getMessageLinkMetaImage = messageId => state => getMessageById(messageId)(state)?.linkMeta?.image;
export const getMessageLinkMetaTitle = messageId => state => getMessageById(messageId)(state)?.linkMeta?.title;

export const getFirstInSeries = (messageId, previousMessageId) => state =>
	getMessageAuthorId(messageId)(state) !== getMessageAuthorId(previousMessageId)(state);

export const getMessageImageTokens = messageId => state =>
	_.filter(getMessageTokens(messageId)(state) || [], { type: "image" });

const mobileParam = isMobile ? "?small=true" : "";

export const getImageUrls = messageId => state => {
	const bunkerServesImages = getBunkerServesImages(state);
	const messageImageTokens = getMessageImageTokens(messageId)(state);
	const wrapImageForBunkerToServe = isMobile || bunkerServesImages;
	return messageImageTokens.map(
		token => (wrapImageForBunkerToServe ? `/api/image/${encodeURIComponent(token.value)}${mobileParam}` : token.value)
	);
};
