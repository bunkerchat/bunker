import { createSelector } from "@reduxjs/toolkit";
import { getActiveRoomId } from "../room/roomSelectors.js";

const getChatByRoom = state => state.chatInput.byRoom;

export const getChatForCurrentRoom = createSelector(
	[getActiveRoomId, getChatByRoom],
	(activeRoomId, chatByRoomId) => chatByRoomId[activeRoomId]
);

export const getAppendTextForCurrentRoom = createSelector(
	[getChatForCurrentRoom],
	(getChatForCurrentRoom = {}) => getChatForCurrentRoom.appendText
);

export const getCurrentRoomTextEmpty = createSelector([getAppendTextForCurrentRoom], (text = "") => text.length === 0);

export const getEditedMessageForCurrentRoom = createSelector(
	[getChatForCurrentRoom],
	(chatForCurrentRoom = {}) => chatForCurrentRoom.editedMessage
);
