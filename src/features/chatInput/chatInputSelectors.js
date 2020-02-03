import { getActiveRoomId } from "../room/roomSelectors.js";

const getChatByRoom = state => state.chatInput.byRoom;

export const getChatForCurrentRoom = state => getChatByRoom(state)[getActiveRoomId(state)];

export const getAppendTextForCurrentRoom = state => getChatForCurrentRoom(state)?.appendText;

export const getEditedMessageForCurrentRoom = state => getChatForCurrentRoom(state)?.editedMessage;

export const getNewText = state => getChatForCurrentRoom(state)?.newText;
